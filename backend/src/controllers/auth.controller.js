import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";



const generateAccessToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
  );
};

const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
  );
};



const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};



export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({
        message: "All fields required",
      });

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser)
      return res.status(400).json({
        message: "Email already registered",
      });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

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
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Registration failed",
    });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user)
      return res.status(400).json({
        message: "Invalid credentials",
      });

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match)
      return res.status(400).json({
        message: "Invalid credentials",
      });

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

    res.status(200).json({
      message: "Login successful",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Login failed",
    });
  }
};



export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token)
      return res.status(401).json({
        message: "No refresh token",
      });

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET
    );

    const newAccessToken =
      generateAccessToken(decoded.id);

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      message: "Token refreshed",
    });

  } catch {
    res.status(401).json({
      message: "Invalid refresh token",
    });
  }
};



export const logout = async (req, res) => {
  try {

    
    res.cookie("accessToken", "", {
      ...cookieOptions,
      maxAge: 0,
    });

    res.cookie("refreshToken", "", {
      ...cookieOptions,
      maxAge: 0,
    });

    res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Logout failed",
    });
  }
};



export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email.toLowerCase(),
    });

    if (!user)
      return res.status(404).json({
        message: "User not found",
      });

    const resetToken =
      crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken =
      crypto.createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.resetPasswordExpire =
      Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      resetLink:
        `${process.env.FRONTEND_URL}/reset-password/${resetToken}`,
    });

  } catch {
    res.status(500).json({
      message: "Reset failed",
    });
  }
};



export const resetPassword = async (req, res) => {
  try {
    const hashedToken =
      crypto.createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user)
      return res.status(400).json({
        message: "Invalid or expired token",
      });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      message: "Password updated",
    });

  } catch {
    res.status(500).json({
      message: "Reset failed",
    });
  }
};



export const getMe = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id
    ).select("-password");

    res.json(user);

  } catch {
    res.status(500).json({
      message: "Failed to fetch user",
    });
  }
};
