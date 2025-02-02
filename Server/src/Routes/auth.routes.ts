import express, { Router } from "express";
import { authController } from "../Controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = express.Router();

router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOtp);
router.post("/login", authController.login);
router.post("/google-auth", authController.googleAuth);
router.post("/refresh-token", authController.refreshToken);
router.post("/send-otp", authController.sendOtp);
router.post(
  "/reset-password",
  authMiddleware.verifyAccessToken,
  authController.resetPassword
);
router.post(
  "/forgot-password",
  authMiddleware.verifyAccessToken,
  authController.forgotPassword
);
router.post("/logout", authController.logout);

export default router;
