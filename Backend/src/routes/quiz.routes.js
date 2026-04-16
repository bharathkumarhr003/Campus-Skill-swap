import { Router } from "express";
import {
    createQuiz,
    getAllQuizzes,
    getQuizzesBySkill,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    getAllQuizzesAdmin,
    updateQuizStatus
} from "../controllers/quiz.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.use(verifyJWT_username);

router.route("/").post(createQuiz).get(getAllQuizzes);
router.route("/:quizId").get(getQuizById).put(updateQuiz).delete(deleteQuiz);
router.route("/skill/:skill").get(getQuizzesBySkill);

// Admin routes
router.route("/admin/all").get(getAllQuizzesAdmin);
router.route("/admin/:quizId/status").put(updateQuizStatus);

export default router;