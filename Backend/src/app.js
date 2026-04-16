import express from "express";
console.log("Express imported");
import cors from "cors";
console.log("CORS imported");
import cookieParser from "cookie-parser";
console.log("Cookie parser imported");
import passport from "passport";
console.log("Passport imported");

const app = express();
console.log("Express app created");

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"],
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); // to parse json in body
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // to parse url
app.use(express.static("public")); // to use static public folder
app.use(cookieParser()); // to enable CRUD operation on browser cookies


// Passport middleware
app.use(passport.initialize());
console.log("Passport initialized");

// Importing routes
console.log("Importing routes...");
import userRouter from "./routes/user.routes.js";
console.log("User routes imported");
import authRouter from "./routes/auth.routes.js";
console.log("Auth routes imported");
import chatRouter from "./routes/chat.routes.js";
console.log("Chat routes imported");
import messageRouter from "./routes/message.routes.js";
console.log("Message routes imported");
import requestRouter from "./routes/request.routes.js";
console.log("Request routes imported");
import reportRouter from "./routes/report.routes.js";
console.log("Report routes imported");
import ratingRouter from "./routes/rating.routes.js";
console.log("Rating routes imported");
import bountyRouter from "./routes/bounty.routes.js";
console.log("Bounty routes imported");
import quizRouter from "./routes/quiz.routes.js";
console.log("Quiz routes imported");
import assessmentRouter from "./routes/assessment.routes.js";
console.log("Assessment routes imported");
import badgeRouter from "./routes/badge.routes.js";
console.log("Badge routes imported");

// Using routes
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/message", messageRouter);
app.use("/request", requestRouter);
app.use("/report", reportRouter);
app.use("/rating", ratingRouter);
app.use("/bounty", bountyRouter);
app.use("/quiz", quizRouter);
app.use("/assessment", assessmentRouter);
app.use("/badge", badgeRouter);

export { app };
