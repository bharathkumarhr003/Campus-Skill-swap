
import dotenv from "dotenv";
dotenv.config({
    path: './.env'
});
import connectDB from "./config/connectDB.js";
import { app } from "./app.js";
import { Server } from "socket.io";

console.log("Starting server...");

const port = process.env.PORT || 8000;

console.log("Attempting to connect to the database...");

const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected");

    const server = app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });

    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: "*",
      },
    });

    global.io = io;

    io.on("connection", (socket) => {
      console.log("Connected to socket");

      socket.on("setup", (userData) => {
        console.log("Connected to socket in setup: ", userData.username);
        socket.join(userData._id);
        socket.emit("connected");
      });

      socket.on("join chat", (room) => {
        console.log("Joining chat: ", room);
        socket.join(room);
        console.log("Joined chat: ", room);
      });

      socket.on("typing", (room) => {
        socket.in(room).emit("typing", room);
      });

      socket.on("stop typing", (room) => {
        socket.in(room).emit("stop typing", room);
      });

      socket.on("new message", (newMessage) => {
        // console.log("New message: ", newMessage);
        var chat = newMessage.chatId;
        if (!chat.users) return console.log("Chat.users not defined");
        // console.log("Chat.users: ", chat.users);
        chat.users.forEach((user) => {
          // console.log("User: ", user);
          if (user._id === newMessage.sender._id) return;
          io.to(user._id).emit("message recieved", newMessage);
          console.log("Message sent to: ", user._id);
        });
      });

      socket.off("setup", () => {
        console.log("Disconnected from socket");
        console.log("Disconnected from socket");
        socket.leave(userData._id);
      });
    });
  } catch (err) {
    console.error("Failed to connect to the database!", err);
    process.exit(1);
  }
};

startServer();
