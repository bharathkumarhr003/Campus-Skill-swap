import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["multiple-choice", "true-false", "short-answer"],
        default: "multiple-choice"
    },
    options: [{
        type: String
    }],
    correctAnswer: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

export const Question = mongoose.model("Question", questionSchema);