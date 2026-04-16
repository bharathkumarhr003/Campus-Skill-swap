import express from "express";
import { createReport, getAllReports, updateReportStatus } from "../controllers/report.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = express.Router();

router.post("/create", verifyJWT_username, createReport);
router.get("/", verifyJWT_username, getAllReports);
router.patch("/:reportId", verifyJWT_username, updateReportStatus);

export default router;
