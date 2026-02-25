import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";



const generateAccessToken = (id) => {
    return jwt.sign({ id },
        process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
    );
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id },
        process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
    );
};



const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
};



export const register = async(req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: "All fields are required" });

        if (password.length < 6)
            return res.status(400).json({ message: "Password must be at least 6 characters" });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "Email already registered" });

        const user = await User.create({ name, email, password });

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Registration failed" });
    }
};



export const login = async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user)
            return res.status(400).json({ message: "Invalid email or password" });

        const match = await bcrypt.compare(password, user.password);

        if (!match)
            return res.status(400).json({ message: "Invalid email or password" });

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
    }
};



export const refreshToken = async(req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token)
            return res.status(401).json({ message: "No refresh token" });

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        const user = await User.findById(decoded.id);
        if (!user)
            return res.status(401).json({ message: "User not found" });

        const newAccessToken = generateAccessToken(user._id);

        res.cookie("accessToken", newAccessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });

        res.json({ message: "Access token refreshed" });

    } catch (error) {
        res.status(401).json({ message: "Invalid refresh token" });
    }
};



export const logout = (req, res) => {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    res.json({ message: "Logged out successfully" });
};



export const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

        await user.save({ validateBeforeSave: false });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        res.json({
            message: "Reset link generated",
            resetLink,
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Failed to generate reset link" });
    }
};



export const resetPassword = async(req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6)
            return res.status(400).json({ message: "Password must be at least 6 characters" });

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: new Date() },
        }).select("+password");

        if (!user)
            return res.status(400).json({ message: "Invalid or expired reset link" });

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Password reset failed" });
    }
};



export const getMe = async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user" });
    }
};
