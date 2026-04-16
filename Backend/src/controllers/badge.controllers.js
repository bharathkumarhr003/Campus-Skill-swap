import { Badge } from "../models/badge.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

// Create a new badge (Admin only)
const createBadge = asyncHandler(async (req, res) => {
    const { name, skill, description, image, criteria } = req.body;

    // Check if user is admin
    const user = await User.findById(req.user._id);
    if (!user.isAdmin) {
        throw new ApiError(403, "Admin access required");
    }

    if (!name || !skill || !criteria) {
        throw new ApiError(400, "Name, skill, and criteria are required");
    }

    const badge = await Badge.create({
        name,
        skill,
        description,
        image: image || "https://via.placeholder.com/100x100?text=Badge", // Default badge image
        criteria,
        createdBy: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, badge, "Badge created successfully"));
});

// Get all badges
const getAllBadges = asyncHandler(async (req, res) => {
    const badges = await Badge.find({})
        .populate("createdBy", "name username")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, badges, "Badges fetched successfully"));
});

// Get badges by skill
const getBadgesBySkill = asyncHandler(async (req, res) => {
    const { skill } = req.params;

    const badges = await Badge.find({ skill })
        .populate("createdBy", "name username")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, badges, "Badges fetched successfully"));
});

// Update badge
const updateBadge = asyncHandler(async (req, res) => {
    const { badgeId } = req.params;
    const updates = req.body;

    // Check if user is admin
    const user = await User.findById(req.user._id);
    if (!user.isAdmin) {
        throw new ApiError(403, "Admin access required");
    }

    const badge = await Badge.findByIdAndUpdate(badgeId, updates, { new: true });

    if (!badge) {
        throw new ApiError(404, "Badge not found");
    }

    return res.status(200).json(new ApiResponse(200, badge, "Badge updated successfully"));
});

// Delete badge
const deleteBadge = asyncHandler(async (req, res) => {
    const { badgeId } = req.params;

    // Check if user is admin
    const user = await User.findById(req.user._id);
    if (!user.isAdmin) {
        throw new ApiError(403, "Admin access required");
    }

    const badge = await Badge.findByIdAndDelete(badgeId);

    if (!badge) {
        throw new ApiError(404, "Badge not found");
    }

    return res.status(200).json(new ApiResponse(200, null, "Badge deleted successfully"));
});

// Award badge to user
const awardBadge = asyncHandler(async (req, res) => {
    const { userId, badgeId } = req.body;

    // Check if user is admin or the user themselves (for auto-award)
    const requester = await User.findById(req.user._id);
    if (!requester.isAdmin && req.user._id.toString() !== userId) {
        throw new ApiError(403, "Not authorized to award badge");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const badge = await Badge.findById(badgeId);
    if (!badge) {
        throw new ApiError(404, "Badge not found");
    }

    // Check if user already has the badge
    if (user.badges.includes(badgeId)) {
        throw new ApiError(400, "User already has this badge");
    }

    user.badges.push(badgeId);
    await user.save();

    return res.status(200).json(new ApiResponse(200, user.badges, "Badge awarded successfully"));
});

// Get user's badges
const getUserBadges = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId).populate('badges');
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, user.badges, "User badges fetched successfully"));
});

// Check and award badges based on criteria (auto-award)
const checkAndAwardBadges = asyncHandler(async (userId, action, data) => {
    const user = await User.findById(userId).populate('badges');
    if (!user) return;

    const badges = await Badge.find({});

    for (const badge of badges) {
        // Skip if user already has it
        if (user.badges.some(b => b._id.toString() === badge._id.toString())) continue;

        let award = false;

        switch (badge.criteria) {
            case 'Complete 1 bounty':
                if (action === 'bounty_completed' && data.completedCount >= 1) award = true;
                break;
            case 'Complete 5 bounties':
                if (action === 'bounty_completed' && data.completedCount >= 5) award = true;
                break;
            case 'Complete 10 bounties':
                if (action === 'bounty_completed' && data.completedCount >= 10) award = true;
                break;
            case 'Pass quiz with 80%':
                if (action === 'quiz_passed' && data.score >= 80) award = true;
                break;
            // Add more criteria as needed
            default:
                break;
        }

        if (award) {
            user.badges.push(badge._id);
            await user.save();
            // Could emit notification here
        }
    }
});

export {
    createBadge,
    getAllBadges,
    getBadgesBySkill,
    updateBadge,
    deleteBadge,
    awardBadge,
    getUserBadges,
    checkAndAwardBadges
};