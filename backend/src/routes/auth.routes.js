import express from "express";
import {
    register,
    login,
    logout,
    refreshToken,
    getMe,
    forgotPassword,
    resetPassword
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();


router.get("/test", (req, res) => {
    res.json({ message: "Auth routes working " });
});


router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);

router.get("/me", protect, getMe);


router.post("/forgot-password", forgotPassword);
router.post("/reset/:token", resetPassword);

export default router;