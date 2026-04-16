import { Router } from "express";
import {
    createBadge,
    getAllBadges,
    getBadgesBySkill,
    updateBadge,
    deleteBadge,
    awardBadge,
    getUserBadges
} from "../controllers/badge.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.use(verifyJWT_username);

router.route("/").post(createBadge).get(getAllBadges);
router.route("/:badgeId").put(updateBadge).delete(deleteBadge);
router.route("/skill/:skill").get(getBadgesBySkill);
router.route("/award").post(awardBadge);
router.route("/user/:userId").get(getUserBadges);

export default router;