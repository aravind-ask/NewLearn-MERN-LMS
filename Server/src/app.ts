import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
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
import multer from "multer";

dotenv.config();
const app = express();

const upload = multer();

cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
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

export default app;
