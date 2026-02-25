import Feedback from "../models/Feedback.js";
import Interview from "../models/Interview.js";


/* SUBMIT FEEDBACK*/
export const submitFeedback = async(req, res) => {
    try {
        const userId = req.user?._id;
        const { interviewId, rating, comment } = req.body;


        if (!interviewId || !rating) {
            return res.status(400).json({ message: "Interview and rating are required" });
        }


        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }


        if (interview.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized feedback attempt" });
        }


        const feedback = await Feedback.create({
            user: userId,
            interview: interviewId,
            rating,
            comment
        });

        res.status(201).json({
            message: "Feedback submitted successfully",
            feedback
        });

    } catch (error) {
        console.error("Feedback submit error:", error);
        res.status(500).json({ message: "Failed to submit feedback" });
    }
};



/* GET MY FEEDBACKS */
export const getMyFeedbacks = async(req, res) => {
    try {
        const userId = req.user?._id;

        const feedbacks = await Feedback.find({ user: userId })
            .populate("interview", "role difficulty totalScore status createdAt")
            .sort({ createdAt: -1 });

        res.json(feedbacks);

    } catch (error) {
        console.error("Fetch feedback error:", error);
        res.status(500).json({ message: "Failed to fetch feedbacks" });
    }
};



export const getInterviewFeedback = async(req, res) => {
    try {
        const { interviewId } = req.params;

        const feedback = await Feedback.findOne({ interview: interviewId })
            .populate("user", "name email");

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        res.json(feedback);

    } catch (error) {
        console.error("Fetch interview feedback error:", error);
        res.status(500).json({ message: "Failed to fetch feedback" });
    }
};