import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Bounty } from "../models/bounty.model.js";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { Notification } from "../models/notification.model.js";
import { sendMail } from "../utils/SendMail.js";
import { checkAndAwardBadges } from "./badge.controllers.js";
import { QuizAttempt } from "../models/quizAttempt.model.js";

// CREATE BOUNTY
export const createBounty = asyncHandler(async (req, res) => {
  const { title, description, reward, tags } = req.body;

  if (!title || !description || !reward) {
    throw new ApiError(400, "Title, description and reward are required");
  }

  const bounty = await Bounty.create({
    title,
    description,
    reward: Number(reward),
    tags: tags || [],
    createdBy: req.user._id,
    status: "OPEN",
  });

  // Notify users with matching skills
  if (tags && tags.length > 0) {
    const matchingUsers = await User.find({ 
      skillsProficientAt: { $in: tags },
      notificationsEnabled: true
    });
    if (matchingUsers.length > 0) {
      const notifications = matchingUsers.map(user => ({
        user: user._id,
        message: `A new bounty "${title}" matches your skills: ${tags.join(', ')}`,
        type: 'bounty_match',
        relatedId: bounty._id,
      }));
      await Notification.insertMany(notifications);
      // Emit real-time notifications
      matchingUsers.forEach(user => {
        global.io.to(user._id.toString()).emit('notification', {
          message: `A new bounty "${title}" matches your skills: ${tags.join(', ')}`,
          type: 'bounty_match',
          relatedId: bounty._id,
        });
      });
      // Send email notifications
      matchingUsers.forEach(async (user) => {
        const subject = `New Bounty Match: ${title}`;
        const message = `
          <h2>Hello ${user.name},</h2>
          <p>A new bounty has been posted that matches your skills!</p>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Skills:</strong> ${tags.join(', ')}</p>
          <p><strong>Reward:</strong> ${reward} Skill Coins</p>
          <p>Check it out on SkillSwap!</p>
        `;
        await sendMail(user.email, subject, message);
      });
    }
  }

  return res
    .status(201)
    .json(new ApiResponse(201, bounty, "Bounty created successfully"));
});

// GET ALL
export const getAllBounties = asyncHandler(async (req, res) => {
  const bounties = await Bounty.find({ status: "OPEN" })
    .populate("createdBy", "name username picture rating")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, bounties, "Bounties fetched successfully"));
});

// GET MY BOUNTIES
export const getMyBounties = asyncHandler(async (req, res) => {
  const bounties = await Bounty.find({ createdBy: req.user._id })
    .populate("createdBy", "name username picture rating")
    .populate("applicants", "name username picture rating")
    .populate("assignedTo", "name username picture rating")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, bounties, "Your bounties fetched successfully"));
});

// GET BY ID
export const getBountyById = asyncHandler(async (req, res) => {
  const bounty = await Bounty.findById(req.params.bountyId)
    .populate("createdBy", "name username picture")
    .populate("applicants", "name username picture rating")
    .populate("assignedTo", "name username picture");

  if (!bounty) throw new ApiError(404, "Bounty not found");

  return res
    .status(200)
    .json(new ApiResponse(200, bounty, "Bounty details fetched"));
});

// CLAIM
export const claimBounty = asyncHandler(async (req, res) => {
  const bounty = await Bounty.findById(req.params.bountyId);
  if (!bounty) throw new ApiError(404, "Bounty not found");

  if (bounty.createdBy.equals(req.user._id))
    throw new ApiError(400, "You cannot apply to your own bounty");

  if (bounty.applicants.some(id => id.equals(req.user._id)))
    throw new ApiError(400, "Already applied");

  bounty.applicants.push(req.user._id);
  await bounty.save();

  return res
    .status(200)
    .json(new ApiResponse(200, bounty, "Applied successfully"));
});

// APPROVE
export const approveBounty = asyncHandler(async (req, res) => {
  const { applicantId } = req.body;
  const bounty = await Bounty.findById(req.params.bountyId);

  if (!bounty) throw new ApiError(404, "Bounty not found");
  if (!bounty.createdBy.equals(req.user._id))
    throw new ApiError(403, "Only creator can approve");

  if (!bounty.applicants.some(id => id.equals(applicantId)))
    throw new ApiError(400, "Invalid applicant");

  bounty.assignedTo = applicantId;
  bounty.status = "IN_PROGRESS";
  await bounty.save();

  // Create or find chat between creator and assignee
  let chat = await Chat.findOne({
    users: { $all: [req.user._id, applicantId], $size: 2 }
  });
  if (!chat) {
    chat = await Chat.create({
      users: [req.user._id, applicantId],
    });
  }

  // Notify the assigned user
  const notification = await Notification.create({
    user: applicantId,
    message: `You have been assigned to the bounty "${bounty.title}". Chat with the creator.`,
    type: 'bounty_assigned',
    relatedId: bounty._id,
  });
  global.io.to(applicantId.toString()).emit('notification', {
    message: `You have been assigned to the bounty "${bounty.title}". Chat with the creator.`,
    type: 'bounty_assigned',
    relatedId: bounty._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, bounty, "Applicant approved"));
});

// UPDATE PROGRESS
export const updateProgress = asyncHandler(async (req, res) => {
  const { progress } = req.body;
  const bounty = await Bounty.findById(req.params.bountyId);

  if (!bounty) throw new ApiError(404, "Bounty not found");
  if (!bounty.assignedTo.equals(req.user._id) && !bounty.createdBy.equals(req.user._id))
    throw new ApiError(403, "Only assigned user or creator can update progress");

  if (progress < 0 || progress > 100) throw new ApiError(400, "Progress must be between 0 and 100");

  bounty.progress = progress;
  await bounty.save();

  return res
    .status(200)
    .json(new ApiResponse(200, bounty, "Progress updated"));
});

// COMPLETE
export const completeBounty = asyncHandler(async (req, res) => {
  const bounty = await Bounty.findById(req.params.bountyId);
  if (!bounty) throw new ApiError(404, "Bounty not found");

  if (!bounty.createdBy.equals(req.user._id))
    throw new ApiError(403, "Only creator can complete");

  if (!bounty.assignedTo)
    throw new ApiError(400, "No helper assigned");

  const helper = await User.findById(bounty.assignedTo);
  const creator = await User.findById(bounty.createdBy);

  if (!helper || !creator) throw new ApiError(404, "User not found");

  if (creator.skillCoins < bounty.reward)
    throw new ApiError(400, "Insufficient coins");

  creator.skillCoins -= bounty.reward;
  helper.skillCoins += bounty.reward;

  bounty.status = "COMPLETED";

  await creator.save();
  await helper.save();
  await bounty.save();

  // Check and award badges to helper
  const helperCompletedCount = await Bounty.countDocuments({ assignedTo: bounty.assignedTo, status: "COMPLETED" });
  await checkAndAwardBadges(bounty.assignedTo, 'bounty_completed', { completedCount: helperCompletedCount });

  // Notify the helper
  const notification = await Notification.create({
    user: bounty.assignedTo,
    message: `Bounty "${bounty.title}" has been completed. You received ${bounty.reward} Skill Coins.`,
    type: 'bounty_completed',
    relatedId: bounty._id,
  });
  global.io.to(bounty.assignedTo.toString()).emit('notification', {
    message: `Bounty "${bounty.title}" has been completed. You received ${bounty.reward} Skill Coins.`,
    type: 'bounty_completed',
    relatedId: bounty._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, bounty, "Completed and coins transferred"));
});

// DISCOVER
export const getDiscoverBounties = asyncHandler(async (req, res) => {
  const forYou = await Bounty.find({ status: "OPEN" })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("createdBy", "name picture");

  const webDev = await Bounty.find({
    tags: { $in: ["React", "JS", "HTML", "CSS", "MERN"] },
    status: "OPEN",
  })
    .limit(5)
    .populate("createdBy", "name picture");

  const ml = await Bounty.find({
    tags: { $in: ["Python", "ML", "TensorFlow"] },
    status: "OPEN",
  })
    .limit(5)
    .populate("createdBy", "name picture");

  const others = await Bounty.find({
    tags: { $nin: ["React", "JS", "HTML", "CSS", "Python", "ML"] },
    status: "OPEN",
  })
    .limit(5)
    .populate("createdBy", "name picture");

  return res.status(200).json(
    new ApiResponse(
      200,
      { forYou, webDev, ml, others },
      "Discover bounties fetched"
    )
  );
});

// GET quiz for bounty
export const getBountyQuiz = asyncHandler(async (req, res) => {
  const bounty = await Bounty.findById(req.params.bountyId);
  if (!bounty) throw new ApiError(404, "Bounty not found");

  const quiz = bounty.quiz || { required: false, questions: [] };

  // If quiz is required but no questions exist, generate up to 10 MCQs from tags
  if (quiz.required && (!quiz.questions || quiz.questions.length === 0)) {
    const templates = {
      react: [
        {
          question: "Which React Hook is used to add state to a functional component?",
          options: ["useState", "useEffect", "useContext", "useRef"],
          answerIndex: 0,
        },
        {
          question: "Which method is used to render React elements to the DOM?",
          options: ["React.render()", "ReactDOM.render()", "renderDOM()", "mount()"],
          answerIndex: 1,
        },
      ],
      javascript: [
        {
          question: "Which keyword declares a block-scoped variable in modern JavaScript?",
          options: ["var", "let", "function", "const"],
          answerIndex: 1,
        },
        {
          question: "Which array method creates a new array with the results of calling a function on every element?",
          options: ["forEach", "map", "filter", "reduce"],
          answerIndex: 1,
        },
      ],
      python: [
        {
          question: "Which keyword is used to define a function in Python?",
          options: ["def", "function", "fn", "define"],
          answerIndex: 0,
        },
        {
          question: "Which data structure is immutable in Python?",
          options: ["list", "dict", "tuple", "set"],
          answerIndex: 2,
        },
      ],
      java: [
        {
          question: "Which keyword is used to create a new object in Java?",
          options: ["new", "create", "construct", "init"],
          answerIndex: 0,
        },
      ],
      default: [
        {
          question: "Which option best matches the core concept of this skill?",
          options: ["Answer A", "Answer B", "Answer C", "Answer D"],
          answerIndex: 0,
        },
      ],
    };

    const generated = [];
    const tags = (bounty.tags || []).slice(0, 10);
    for (let t of tags) {
      const key = t.toLowerCase();
      const pool = templates[key] || templates[Object.keys(templates).find(k => key.includes(k))] || templates.default;
      // pick a random question from pool
      const item = pool[Math.floor(Math.random() * pool.length)];
      generated.push({ question: item.question, options: item.options, answerIndex: item.answerIndex });
      if (generated.length >= 10) break;
    }

    // If still zero (no tags), generate a couple of default questions
    if (generated.length === 0) {
      generated.push(...templates.default);
    }

    // persist generated quiz so attempts can be graded
    bounty.quiz = { required: true, questions: generated };
    await bounty.save();
    quiz.questions = generated;
  }

  // Do not expose answerIndex to clients
  const publicQuestions = (quiz.questions || []).map((q) => ({ question: q.question, options: q.options }));

  return res.status(200).json(new ApiResponse(200, { required: !!quiz.required, questions: publicQuestions }, "Quiz fetched"));
});

// Submit quiz attempt
export const submitQuizAttempt = asyncHandler(async (req, res) => {
  const { answers } = req.body; // answers: [{ questionIndex, selectedIndex }]
  const bounty = await Bounty.findById(req.params.bountyId);
  if (!bounty) throw new ApiError(404, "Bounty not found");

  const quiz = bounty.quiz || { required: false, questions: [] };
  if (!quiz.required) throw new ApiError(400, "Quiz not required for this bounty");

  if (!Array.isArray(answers)) throw new ApiError(400, "Invalid answers");

  // Calculate score
  const total = quiz.questions.length;
  let correct = 0;
  answers.forEach((a) => {
    const q = quiz.questions[a.questionIndex];
    if (q && q.answerIndex === a.selectedIndex) correct += 1;
  });
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);
  const passed = score >= 60; // default pass threshold

  const attempt = await QuizAttempt.create({
    bounty: bounty._id,
    user: req.user._id,
    answers,
    score,
    passed,
  });

  return res.status(200).json(new ApiResponse(200, { attemptId: attempt._id, score, passed }, "Attempt recorded"));
});

// Get latest attempt for a user on a bounty
export const getQuizAttempt = asyncHandler(async (req, res) => {
  const { bountyId, userId } = req.params;
  const bounty = await Bounty.findById(bountyId);
  if (!bounty) throw new ApiError(404, "Bounty not found");

  const attempt = await QuizAttempt.findOne({ bounty: bountyId, user: userId }).sort({ createdAt: -1 });
  if (!attempt) return res.status(200).json(new ApiResponse(200, null, "No attempts found"));

  return res.status(200).json(new ApiResponse(200, attempt, "Latest attempt"));
});
