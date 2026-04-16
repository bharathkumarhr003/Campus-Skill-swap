import express from "express";
import { sendMessage, getMessages } from "../controllers/message.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/sendMessage", verifyJWT_username, upload.single('file'), sendMessage);
router.get("/getMessages/:chatId", verifyJWT_username, getMessages);

export default router;
