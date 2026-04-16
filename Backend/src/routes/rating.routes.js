import express from "express";
import { rateUser, rateBountyUser } from "../controllers/rating.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = express.Router();

router.post("/rateUser", verifyJWT_username, rateUser);
router.post("/rateBountyUser", verifyJWT_username, rateBountyUser);
// router.get("/getRatings/:username", verifyJWT_username, getRatings);

export default router;
