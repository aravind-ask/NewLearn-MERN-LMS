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
import multer from "multer";
import { setupChatSocket } from "./sockets/chat.socket";
import { setupDiscussionSocket } from "./sockets/discussion.socket";

dotenv.config();

// Initialize Express app
const app = express();
// Create HTTP server
const httpServer = createServer(app);
// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

app.set("io", io); 

const upload = multer();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));

// Database connection
connectDB();

// Routes
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

// Setup WebSocket for chat
setupChatSocket(io);
setupDiscussionSocket(io);

// Error handling middleware
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

// Export the HTTP server instead of the Express app
export default httpServer;
