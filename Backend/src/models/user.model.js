import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },

    skillCoins: {
      type: Number,
      default: 100, // Default 100 coins set maadi
    },
    
    email: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToK4qEfbnd-RN82wdL2awn_PMviy_pelocqQ",
    },
    rating: {
      type: Number,
      default: 1.0,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    linkedinLink: {
      type: String,
      default: "",
    },
    githubLink: {
      type: String,
      default: "",
    },
    portfolioLink: {
      type: String,
      default: "",
    },
    skillsProficientAt: [
      {
        type: String,
        default: "",
      },
    ],
    skillsToLearn: [
      {
        type: String,
        default: "",
      },
    ],
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    education: [
      {
        institution: {
          type: String,
          default: "",
        },
        degree: {
          type: String,
          default: "",
        },
        startDate: {
          type: Date,
          default: null,
        },
        endDate: {
          type: Date,
          default: null, // or you can leave it undefined
        },
        score: {
          type: Number,
          default: 0,
        },
        description: {
          type: String,
          default: "",
        },
      },
    ],
    bio: {
      type: String,
      default: "",
    },
    projects: [
      {
        title: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
        },
        projectLink: {
          type: String,
          default: "",
        },
        techStack: [
          {
            type: String,
            default: "",
          },
        ],
        startDate: {
          type: Date,
          default: null,
        },
        endDate: {
          type: Date,
          default: null,
        },
      },
    ],
    badges: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge"
    }],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
