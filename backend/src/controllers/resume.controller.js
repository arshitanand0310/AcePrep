import Resume from "../models/Resume.js";
import Interview from "../models/Interview.js";
import { parseResume } from "../services/resumeParser.service.js";
import { analyzeResume } from "../services/resumeAnalyzer.service.js";
import { generateInterviewQuestions } from "../services/ai.service.js";

/* AI OUTPUT SANITIZER*/

function cleanArray(arr, limit = 8) {
    if (!Array.isArray(arr)) return [];

    return [...new Set(
        arr
        .map(v => String(v).trim())
        .filter(v => v.length > 1 && v.length < 30)
    )].slice(0, limit);
}

function normalizeProfile(profile) {
    if (!profile) return null;

    return {
        role: String(profile.role || "Software Developer").slice(0, 40),
        experience_level: String(profile.experience_level || "fresher").slice(0, 20),

        skills: cleanArray(profile.skills, 12),
        technologies: cleanArray(profile.technologies, 12),

        projects: (profile.projects || []).slice(0, 4).map((p) => ({
            name: String(p?.name || "Project").slice(0, 60),
            description: String(p?.description || "").slice(0, 200),
            tech_stack: cleanArray(p?.tech_stack, 6),
        })),
    };
}

/* UPLOAD RESUME & ANALYZE */
export const uploadResume = async(req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });

        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });

        /* ---------- STEP 1: TEXT EXTRACTION ---------- */
        let extractedText;
        try {
            extractedText = await parseResume(req.file);
        } catch (err) {
            console.error("PARSE ERROR:", err.message);
            return res.status(400).json({
                message: err.message || "Unable to read resume"
            });
        }

        const cleanText =
            typeof extractedText === "string" ?
            extractedText :
            extractedText?.text || "";

        if (!cleanText || cleanText.length < 30) {
            return res.status(400).json({
                message: "Resume text extraction failed (empty or scanned resume)"
            });
        }

        /* AI PROFILE ANALYSIS */
        let profile = {
            role: "Software Developer",
            skills: [],
            technologies: [],
            projects: [],
            experience_level: "fresher",
        };

        try {
            const aiProfile = await analyzeResume(cleanText);
            profile = normalizeProfile({...profile, ...aiProfile });
        } catch (err) {
            console.error("AI ANALYSIS FAILED:", err.message);
            profile = normalizeProfile(profile);
        }

        /*SAVE RESUME SAFELY*/
        let resume;
        try {
            resume = await Resume.create({
                user: userId,
                filename: req.file.originalname,
                content: cleanText.substring(0, 20000),
                profile
            });
        } catch (dbErr) {
            console.error("DB SAVE FAILED:", dbErr.message);
            return res.status(500).json({ message: "Resume too complex to process" });
        }


        return res.status(201).json({
            message: "Resume analyzed successfully",
            resumeId: resume._id,
            profile
        });

    } catch (error) {
        console.error("UPLOAD FATAL ERROR:", error);
        return res.status(500).json({
            message: "Server error while uploading"
        });
    }
};


export const startResumeInterview = async(req, res) => {
    try {
        const userId = req.user?._id;
        const { id } = req.params;

        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });

        const resume = await Resume.findById(id);

        if (!resume)
            return res.status(404).json({ message: "Resume not found" });

        if (resume.user.toString() !== userId.toString())
            return res.status(403).json({ message: "Forbidden" });

        const profile = resume.profile;


        const questions = await generateInterviewQuestions(profile, "medium");

        if (!questions || questions.length === 0)
            return res.status(500).json({ message: "AI failed to generate questions" });


        const interview = await Interview.create({
            user: userId,
            type: "resume",
            role: profile.role,
            difficulty: "medium",
            questions,
            answers: [],
            totalScore: 0,
            status: "generated",
            resume: resume._id
        });

        res.json({
            interviewId: interview._id,
            questions
        });

    } catch (error) {
        console.error("Start resume interview error:", error);
        res.status(500).json({ message: "Failed to start resume interview" });
    }
};


export const getMyResumes = async(req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });

        const resumes = await Resume.find({ user: userId })
            .select("filename createdAt profile.role profile.experience_level")
            .sort({ createdAt: -1 });

        res.json(resumes);

    } catch (error) {
        console.error("Fetch resumes error:", error);
        res.status(500).json({ message: "Failed to fetch resumes" });
    }
};


export const getResumeProfile = async(req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume)
            return res.status(404).json({ message: "Resume not found" });

        res.json(resume.profile);

    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
};


export const deleteResume = async(req, res) => {
    try {
        const userId = req.user?._id;

        const resume = await Resume.findById(req.params.id);

        if (!resume)
            return res.status(404).json({ message: "Resume not found" });

        if (resume.user.toString() !== userId.toString())
            return res.status(403).json({ message: "Forbidden" });

        await resume.deleteOne();

        res.json({ message: "Resume deleted successfully" });

    } catch (error) {
        console.error("Delete resume error:", error);
        res.status(500).json({ message: "Failed to delete resume" });
    }
};