import { Assessment } from "../models/assessment.model.js";
import { Quiz } from "../models/quiz.model.js";
import { Question } from "../models/question.model.js";
import { Badge } from "../models/badge.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// Submit quiz answers and calculate score
const submitQuiz = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const { answers } = req.body; // answers: [{ questionId, answer }]
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId).populate("questions");
    if (!quiz) {
        throw new ApiError(404, "Quiz not found");
    }

    let totalScore = 0;
    let maxScore = 0;
    const processedAnswers = [];

    for (const question of quiz.questions) {
        maxScore += question.points;
        const userAnswer = answers.find(a => a.questionId === question._id.toString());

        let isCorrect = false;
        if (userAnswer) {
            isCorrect = question.correctAnswer.toLowerCase().trim() === userAnswer.answer.toLowerCase().trim();
            if (isCorrect) {
                totalScore += question.points;
            }
        }

        processedAnswers.push({
            question: question._id,
            answer: userAnswer ? userAnswer.answer : "",
            isCorrect
        });
    }

    const percentageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = percentageScore >= quiz.passingScore;

    const assessment = await Assessment.create({
        user: userId,
        quiz: quizId,
        answers: processedAnswers,
        score: percentageScore,
        passed
    });

    // Award badge if passed
    let badgeAwarded = null;
    if (passed) {
        const badge = await Badge.findOne({ skill: quiz.skill });
        if (badge) {
            const user = await User.findById(userId);
            if (!user.badges.includes(badge._id)) {
                user.badges.push(badge._id);
                await user.save();
            }
            badgeAwarded = badge;
        }
    }

    return res.status(201).json(new ApiResponse(201, {
        assessment,
        passed,
        badgeAwarded
    }, "Quiz submitted successfully"));
});

// Get user's assessments
const getUserAssessments = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const assessments = await Assessment.find({ user: userId })
        .populate("quiz", "title skill passingScore")
        .sort({ completedAt: -1 });

    return res.status(200).json(new ApiResponse(200, assessments, "Assessments fetched successfully"));
});

// Get assessment by ID
const getAssessmentById = asyncHandler(async (req, res) => {
    const { assessmentId } = req.params;

    const assessment = await Assessment.findById(assessmentId)
        .populate("user", "name username")
        .populate("quiz", "title skill")
        .populate("answers.question", "questionText correctAnswer");

    if (!assessment) {
        throw new ApiError(404, "Assessment not found");
    }

    if (assessment.user._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only view your own assessments");
    }

    return res.status(200).json(new ApiResponse(200, assessment, "Assessment fetched successfully"));
});

export {
    submitQuiz,
    getUserAssessments,
    getAssessmentById
};