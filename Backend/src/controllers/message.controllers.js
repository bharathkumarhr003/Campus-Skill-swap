import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";
import { generateJWTToken_username } from "../utils/generateJWTToken.js";
import { Message } from "../models/message.model.js";
import { Chat } from "../models/chat.model.js";

export const sendMessage = asyncHandler(async (req, res) => {
  console.log("\n******** Inside sendMessage Controller function ********");

  const { chatId, content } = req.body;
  const file = req.file;

  if (!chatId || (!content && !file)) {
    throw new ApiError(400, "Please provide chatId and content or file");
  }

  const sender = req.user._id;

  const check = await Chat.findOne({ _id: chatId });
  if (!check.users.includes(sender)) {
    throw new ApiError(400, "Chat is not approved");
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(400, "Chat not found");
  }

  let messageData = {
    chatId: chatId,
    sender: sender,
  };

  if (file) {
    // Upload to Cloudinary or handle file
    // Assuming Cloudinary is set up
    const cloudinary = await import('cloudinary').then(m => m.v2);
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: 'messages',
    });
    messageData.file = uploadResult.secure_url;
    messageData.fileName = file.originalname;
    messageData.messageType = 'file';
    if (content) messageData.content = content;
  } else {
    messageData.content = content;
    messageData.messageType = 'text';
  }

  var message = await Message.create(messageData);

  message = await message.populate("sender", "username name email picture");
  message = await message.populate("chatId");

  message = await User.populate(message, {
    path: "chatId.users",
    select: "username name email picture",
  });

  await Chat.findByIdAndUpdate(
    { _id: chatId },
    {
      latestMessage: message,
    }
  );

  // Emit to all users in chat
  chat.users.forEach(userId => {
    if (userId.toString() !== sender.toString()) {
      global.io.to(userId.toString()).emit('message', message);
    }
  });

  return res.status(201).json(new ApiResponse(201, message, "Message sent successfully"));
});

export const getMessages = asyncHandler(async (req, res) => {
  console.log("\n******** Inside getMessages Controller function ********");

  const chatId = req.params.chatId;
  // console.log("Chat ID: ", chatId);

  const messages = await Message.find({ chatId: chatId }).populate("sender", "username name email picture chatId");

  return res.status(200).json(new ApiResponse(200, messages, "Messages fetched successfully"));
});
