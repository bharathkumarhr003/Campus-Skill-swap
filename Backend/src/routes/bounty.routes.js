import { Router } from "express";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";
import {
  createBounty,
  getAllBounties,
  getBountyById,
  claimBounty,
  completeBounty,
  getDiscoverBounties,
  getBountyQuiz,
  submitQuizAttempt,
  getQuizAttempt,
  approveBounty,
  updateProgress,
  getMyBounties,
} from "../controllers/bounty.controllers.js";

const router = Router();

// Protect all bounty routes
router.use(verifyJWT_username);

// Discover page data (must be before dynamic routes)
router.route("/discover").get(getDiscoverBounties);

// Create bounty & list all open bounties
router.route("/")
  .post(createBounty)
  .get(getAllBounties);

// Get my bounties
router.route("/my").get(getMyBounties);

// Individual bounty routes
router.route("/:bountyId")
  .get(getBountyById);

// Quiz endpoints
router.route("/:bountyId/quiz")
  .get(getBountyQuiz)
  .post(submitQuizAttempt);

router.route("/:bountyId/quiz/attempts/:userId")
  .get(getQuizAttempt);

// Actions on bounty
router.route("/:bountyId/claim")
  .patch(claimBounty);

router.route("/:bountyId/approve")
  .patch(approveBounty);

router.route("/:bountyId/progress")
  .patch(updateProgress);

router.route("/:bountyId/complete")
  .patch(completeBounty);

export default router;
