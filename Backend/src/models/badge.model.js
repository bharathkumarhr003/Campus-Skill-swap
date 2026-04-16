import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    skill: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String, // URL to badge image
        required: true
    },
    criteria: {
        type: String,
        required: true // e.g., "Pass quiz with 80% score"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export const Badge = mongoose.model("Badge", badgeSchema);