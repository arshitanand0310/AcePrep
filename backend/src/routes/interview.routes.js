import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    generateInterview,
    startTopicInterview,
    submitAnswer,
    getInterviewResult,
    getInterviewHistory,
    deleteInterview
} from "../controllers/interview.controller.js";

const router = express.Router();


router.post("/generate", protect, generateInterview);
router.post("/topic", protect, startTopicInterview);


router.post("/answer", protect, submitAnswer);

router.get("/result/:id", protect, getInterviewResult);


router.get("/", protect, getInterviewHistory);


router.delete("/:id", protect, deleteInterview);

export default router;