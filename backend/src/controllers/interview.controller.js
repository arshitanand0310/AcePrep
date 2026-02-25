import Interview from "../models/Interview.js";
import { generateInterviewQuestions } from "../services/ai.service.js";
import { evaluateAnswer } from "../services/evaluate.service.js";


const getUserId = (req) =>
    req.user?._id?.toString() || req.user?.id;


/* GENERATE ROLE INTERVIEW */
export const generateInterview = async(req, res) => {
    try {
        const { role, difficulty } = req.body;
        const userId = getUserId(req);

        if (!role || !difficulty)
            return res.status(400).json({ message: "Role and difficulty are required" });

        if (!userId)
            return res.status(401).json({ message: "Unauthorized user" });

        const questions = await generateInterviewQuestions(role, difficulty);

        const interview = await Interview.create({
            user: userId,
            type: "role",
            role,
            difficulty,
            questions,
            answers: [],
            totalScore: 0,
            status: "generated"
        });

        res.status(201).json({
            interviewId: interview._id,
            questions
        });

    } catch (error) {
        console.error("Generate interview error:", error);
        res.status(500).json({ message: "Interview generation failed" });
    }
};


/* TOPIC INTERVIEW */
export const startTopicInterview = async(req, res) => {
    try {
        const { topic, difficulty } = req.body;
        const userId = getUserId(req);

        if (!topic)
            return res.status(400).json({ message: "Topic is required" });

        const questions = await generateInterviewQuestions(topic, difficulty || "medium");

        const interview = await Interview.create({
            user: userId,
            type: "topic",
            topic,
            difficulty: difficulty || "medium",
            questions,
            answers: [],
            totalScore: 0,
            status: "generated"
        });

        res.json({
            interviewId: interview._id,
            questions
        });

    } catch (error) {
        console.error("Topic interview error:", error);
        res.status(500).json({ message: "Failed to start interview" });
    }
};


/* SUBMIT ANSWER*/
export const submitAnswer = async(req, res) => {
    try {
        const { interviewId, questionIndex, answer } = req.body;
        const userId = getUserId(req);

        const interview = await Interview.findById(interviewId);
        if (!interview) return res.status(404).json({ message: "Interview not found" });

        if (interview.user.toString() !== userId)
            return res.status(403).json({ message: "Unauthorized interview access" });

        const question = interview.questions[questionIndex];
        if (!question)
            return res.status(400).json({ message: "Invalid question index" });

        const evaluation = await evaluateAnswer(question, answer);

        interview.answers.push({
            question,
            userAnswer: answer,
            aiFeedback: evaluation.feedback,
            idealAnswer: evaluation.idealAnswer || "",
            score: evaluation.score
        });

        interview.totalScore += evaluation.score;

        interview.status =
            interview.answers.length === interview.questions.length ?
            "completed" :
            "in_progress";

        await interview.save();

        res.json({
            completed: interview.status === "completed",
            interviewId: interview._id
        });

    } catch (error) {
        console.error("Submit answer error:", error);
        res.status(500).json({ message: "Answer submission failed" });
    }
};


/* INTERVIEW RESULT*/
export const getInterviewResult = async(req, res) => {
    try {
        const interviewId = req.params.id;
        const userId = getUserId(req);

        const interview = await Interview.findById(interviewId);

        if (!interview)
            return res.status(404).json({ message: "Interview not found" });

        if (interview.user.toString() !== userId)
            return res.status(403).json({ message: "Unauthorized access" });

        return res.json({
            type: interview.type,
            role: interview.role,
            topic: interview.topic,
            difficulty: interview.difficulty,
            totalScore: interview.totalScore,
            status: interview.status,
            questions: interview.questions,
            answers: interview.answers
        });

    } catch (error) {
        console.error("Get result error:", error);
        res.status(500).json({ message: "Failed to fetch result" });
    }
};


/* HISTORY*/
export const getInterviewHistory = async(req, res) => {
    try {
        const userId = getUserId(req);

        const interviews = await Interview.find({ user: userId })
            .sort({ createdAt: -1 })
            .select("_id type role topic difficulty createdAt totalScore");

        res.json(interviews);

    } catch (error) {
        console.error("History error:", error);
        res.status(500).json({ message: "Failed to fetch history" });
    }
};


/* DELETE INTERVIEW */
export const deleteInterview = async(req, res) => {
    try {
        const interviewId = req.params.id;
        const userId = getUserId(req);

        const interview = await Interview.findOneAndDelete({
            _id: interviewId,
            user: userId
        });

        if (!interview)
            return res.status(404).json({ message: "Interview not found" });

        res.json({ success: true, message: "Interview deleted successfully" });

    } catch (error) {
        console.error("Delete interview error:", error);
        res.status(500).json({ message: "Failed to delete interview" });
    }
};