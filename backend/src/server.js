import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";

dotenv.config();

const app = express();


app.use(helmet({
    crossOriginResourcePolicy: false, // important for dev
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);

app.use(cookieParser());

/* ======================================================
   MANUAL CORS (100% RELIABLE)
====================================================== */

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", FRONTEND_URL);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );

    // Handle preflight requests
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

/* ======================================================
   BODY PARSER
====================================================== */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ======================================================
   SIMPLE BODY SANITIZATION
====================================================== */

app.use((req, res, next) => {
    if (req.body && typeof req.body === "object") {
        for (let key in req.body) {
            if (key.includes("$") || key.includes(".")) {
                delete req.body[key];
            }
        }
    }
    next();
});

/* ======================================================
   HEALTH CHECK
====================================================== */

app.get("/", (req, res) => {
    res.json({ message: "AcePrep API running 🚀" });
});

/* ======================================================
   API ROUTES
====================================================== */

app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/feedbacks", feedbackRoutes);

/* ======================================================
   API 404 HANDLER
====================================================== */

app.use("/api", (req, res) => {
    res.status(404).json({
        message: "API route not found",
        path: req.originalUrl,
    });
});

/* ======================================================
   GLOBAL ERROR HANDLER
====================================================== */

app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err);

    res.status(500).json({
        message: process.env.NODE_ENV === "production" ?
            "Something went wrong" : err.message,
    });
});



const PORT = process.env.PORT || 5001;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected ");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Local: http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("DB connection failed:", err.message);
    });