import { Quiz } from "../models/quiz.model.js";
import { Question } from "../models/question.model.js";
import { User } from "../models/user.model.js";
import { Badge } from "../models/badge.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// Create a new quiz
const createQuiz = asyncHandler(async (req, res) => {
    const { title, skill, description, passingScore, questions } = req.body;
    const createdBy = req.user._id;

    // Hybrid Approach: Admins can create any quiz, Experts can create quizzes for their certified skills
    const user = await User.findById(createdBy).populate('badges');

    const isAdmin = user.isAdmin;
    const hasExpertBadgeForSkill = user.badges.some(badge =>
        badge.skill === skill && badge.name.toLowerCase().includes('expert')
    );

    if (!isAdmin && !hasExpertBadgeForSkill) {
        throw new ApiError(403, `You need either admin privileges or expert certification in "${skill}" to create quizzes`);
    }

    if (!title || !skill || !passingScore) {
        throw new ApiError(400, "Title, skill, and passing score are required");
    }

    const quiz = await Quiz.create({
        title,
        skill,
        description,
        passingScore,
        createdBy
    });

    // Create questions if provided
    if (questions && questions.length > 0) {
        const questionDocs = questions.map(q => ({
            ...q,
            quiz: quiz._id
        }));
        const createdQuestions = await Question.insertMany(questionDocs);
        quiz.questions = createdQuestions.map(q => q._id);
        await quiz.save();
    }

    return res.status(201).json(new ApiResponse(201, quiz, "Quiz created successfully"));
});

// Get all quizzes
const getAllQuizzes = asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find({ isActive: true })
        .populate("createdBy", "name username")
        .populate("questions");

    return res.status(200).json(new ApiResponse(200, quizzes, "Quizzes fetched successfully"));
});

// Get quizzes by skill
const getQuizzesBySkill = asyncHandler(async (req, res) => {
    const { skill } = req.params;

    const quizzes = await Quiz.find({ skill, isActive: true })
        .populate("createdBy", "name username")
        .populate("questions");

    return res.status(200).json(new ApiResponse(200, quizzes, "Quizzes fetched successfully"));
});

// Get quiz by ID
const getQuizById = asyncHandler(async (req, res) => {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId)
        .populate("createdBy", "name username")
        .populate("questions");

    if (!quiz) {
        throw new ApiError(404, "Quiz not found");
    }

    return res.status(200).json(new ApiResponse(200, quiz, "Quiz fetched successfully"));
});

// Update quiz
const updateQuiz = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const updates = req.body;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
        throw new ApiError(404, "Quiz not found");
    }

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own quizzes");
    }

    Object.assign(quiz, updates);
    await quiz.save();

    return res.status(200).json(new ApiResponse(200, quiz, "Quiz updated successfully"));
});

// Delete quiz
const deleteQuiz = asyncHandler(async (req, res) => {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
        throw new ApiError(404, "Quiz not found");
    }

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own quizzes");
    }

    await Question.deleteMany({ quiz: quizId });
    await Quiz.findByIdAndDelete(quizId);

    return res.status(200).json(new ApiResponse(200, null, "Quiz deleted successfully"));
});

// Admin: Get all quizzes (including inactive ones)
const getAllQuizzesAdmin = asyncHandler(async (req, res) => {
    // Check if user is admin
    const user = await User.findById(req.user._id);
    if (!user.isAdmin) {
        throw new ApiError(403, "Admin access required");
    }

    const quizzes = await Quiz.find({})
        .populate("createdBy", "name username")
        .populate("questions")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, quizzes, "All quizzes fetched successfully"));
});

// Admin: Approve/Reject quiz
const updateQuizStatus = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const { isActive } = req.body;

    // Check if user is admin
    const user = await User.findById(req.user._id);
    if (!user.isAdmin) {
        throw new ApiError(403, "Admin access required");
    }

    const quiz = await Quiz.findByIdAndUpdate(
        quizId,
        { isActive },
        { new: true }
    ).populate("createdBy", "name username");

    if (!quiz) {
        throw new ApiError(404, "Quiz not found");
    }

    return res.status(200).json(new ApiResponse(200, quiz, `Quiz ${isActive ? 'activated' : 'deactivated'} successfully`));
});

export {
    createQuiz,
    getAllQuizzes,
    getQuizzesBySkill,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    getAllQuizzesAdmin,
    updateQuizStatus
};