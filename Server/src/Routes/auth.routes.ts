// src/Routes/auth.routes.ts
import express, { Router } from "express";
import { UserRepository } from "../repositories/userRepository";
import { AuthService } from "../services/auth.service";
import { AuthController } from "../Controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

// Initialize dependencies
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

const router: Router = express.Router();

// Routes
router.post("/register", authController.register.bind(authController));
router.post("/verify-otp", authController.verifyOtp.bind(authController));
router.post("/login", authController.login.bind(authController));
router.post("/google-auth", authController.googleAuth.bind(authController));
router.post("/refresh-token", authController.refreshToken.bind(authController));
router.post("/send-otp", authController.sendOtp.bind(authController));
router.post(
  "/reset-password",
  authMiddleware.verifyAccessToken,
  authController.resetPassword.bind(authController)
);
router.post(
  "/forgot-password",
  authController.forgotPassword.bind(authController)
);
router.post("/logout", authController.logout.bind(authController));

export default router;
