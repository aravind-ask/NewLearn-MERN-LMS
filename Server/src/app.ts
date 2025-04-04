import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db";
import authRoutes from "./Routes/auth.routes";
import userRoutes from "./Routes/user.routes";
import instructorRoutes from "./Routes/instructor.routes";
import categoryRoutes from "./Routes/category.routes";
import courseRoutes from "./Routes/course.routes";
import cartRoutes from "./Routes/cart.routes";
import wishlistRoutes from "./Routes/wishlist.routes";
import paymentRoutes from "./Routes/payment.routes";
import progressRoutes from "./Routes/course.progress.routes";
import ratingsRoutes from "./Routes/ratings.routes";
import offerRoutes from "./Routes/offer.routes";
import chatRoutes from "./Routes/chat.routes";
import discussionRoutes from "./Routes/discussion.routes";
import certificateRoutes from "./Routes/certificates.routes";
import notificationRoutes from "./Routes/notification.routes";
import interviewRoutes from "./Routes/interview.routes";
import multer from "multer";
import { setupChatSocket } from "./sockets/chat.socket";
import { setupDiscussionSocket } from "./sockets/discussion.socket";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL || "https://newlearn-lms.el.r.appspot.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://newlearn-lms.el.r.appspot.com",
];

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

app.set("io", io);

const upload = multer();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(morgan("dev"));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/reviews", ratingsRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/discussion", discussionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/interviews", interviewRoutes);

setupChatSocket(io);
setupDiscussionSocket(io);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.log(err.stack);
    res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
);
//change comment

export default httpServer;
