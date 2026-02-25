import mongoose from "mongoose";

/* 
   ANSWER SUB-SCHEMA
*/
const answerSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },

    userAnswer: {
        type: String,
        required: true
    },

    aiFeedback: {
        type: String,
        default: ""
    },

    idealAnswer: {
        type: String,
        default: ""
    },

    score: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    }
}, { _id: false });


/* 
   INTERVIEW MAIN SCHEMA
 */
const interviewSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


    type: {
        type: String,
        enum: ["resume", "topic"],
        required: true
    },


    role: {
        type: String,
        default: null
    },

    skills: [{
        type: String
    }],


    topic: {
        type: String,
        default: null
    },

    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium"
    },

    questions: [{
        type: String,
        required: true
    }],

    answers: [answerSchema],

    totalScore: {
        type: Number,
        default: 0
    },

    overallFeedback: { // final report summary
        type: String,
        default: ""
    },

    suggestions: { // improvement suggestions
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: ["generated", "in_progress", "completed"],
        default: "generated"
    }

}, { timestamps: true });



const Interview =
    mongoose.models.Interview ||
    mongoose.model("Interview", interviewSchema);

export default Interview;