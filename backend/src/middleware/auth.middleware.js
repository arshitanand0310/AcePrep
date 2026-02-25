import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async(req, res, next) => {
    try {
        let accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({ message: "Not authorized" });
        }

        try {

            const decoded = jwt.verify(
                accessToken,
                process.env.JWT_ACCESS_SECRET
            );

            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            req.user = {
                id: user._id.toString(),
                _id: user._id,
                email: user.email,
                name: user.name,
            };

            return next();

        } catch (accessError) {



            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({ message: "Session expired" });
            }

            try {
                const decodedRefresh = jwt.verify(
                    refreshToken,
                    process.env.JWT_REFRESH_SECRET
                );

                const user = await User.findById(decodedRefresh.id);

                if (!user || !user.refreshTokens) {
                    return res.status(401).json({ message: "Invalid session" });
                }

                const tokenExists = user.refreshTokens.find(
                    (t) => t.token === refreshToken
                );

                if (!tokenExists) {
                    return res.status(401).json({ message: "Invalid session" });
                }



                const newAccessToken = jwt.sign({ id: user._id },
                    process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
                );

                res.cookie("accessToken", newAccessToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    maxAge: 15 * 60 * 1000,
                });

                req.user = {
                    id: user._id.toString(),
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                };

                return next();

            } catch (refreshError) {
                return res.status(401).json({ message: "Session expired" });
            }
        }

    } catch (error) {
        return res.status(401).json({ message: "Not authorized" });
    }
};