import { Router } from "express";
import {
    submitQuiz,
    getUserAssessments,
    getAssessmentById
} from "../controllers/assessment.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.use(verifyJWT_username);

router.route("/submit/:quizId").post(submitQuiz);
router.route("/").get(getUserAssessments);
router.route("/:assessmentId").get(getAssessmentById);

export default router;