import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectDB } from "./config/db";
import authRoutes from "./Routes/auth.routes";
import userRoutes from "./Routes/user.routes";

dotenv.config();
const app = express();

cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

app.use(express.json());
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
