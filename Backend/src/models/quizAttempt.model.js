import mongoose, { Schema } from "mongoose";

const quizAttemptSchema = new Schema({
  bounty: { type: Schema.Types.ObjectId, ref: "Bounty", required: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  answers: [
    {
      questionIndex: { type: Number, required: true },
      selectedIndex: { type: Number, required: true },
    },
  ],
  score: { type: Number, required: true },
  passed: { type: Boolean, required: true },
}, { timestamps: true });

export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
