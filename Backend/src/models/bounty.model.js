import mongoose, { Schema } from "mongoose";

const bountySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "COMPLETED", "CLOSED"],
      default: "OPEN",
      index: true,
    },

    reward: {
      type: Number,
      required: true,
      min: 1,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    applicants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    quiz: {
      required: { type: Boolean, default: false },
      questions: [
        {
          question: { type: String, required: true },
          options: { type: [String], required: true },
          answerIndex: { type: Number, required: true },
        },
      ],
    },
  },
  { timestamps: true }
);

export const Bounty = mongoose.model("Bounty", bountySchema);
