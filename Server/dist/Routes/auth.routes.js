"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/Routes/auth.routes.ts
const express_1 = __importDefault(require("express"));
const userRepository_1 = require("../repositories/userRepository");
const auth_service_1 = require("../services/auth.service");
const auth_controller_1 = require("../Controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
// Initialize dependencies
const userRepository = new userRepository_1.UserRepository();
const authService = new auth_service_1.AuthService(userRepository);
const authController = new auth_controller_1.AuthController(authService);
const router = express_1.default.Router();
// Routes
router.post("/register", authController.register.bind(authController));
router.post("/verify-otp", authController.verifyOtp.bind(authController));
router.post("/login", authController.login.bind(authController));
router.post("/google-auth", authController.googleAuth.bind(authController));
router.post("/refresh-token", authController.refreshToken.bind(authController));
router.post("/send-otp", authController.sendOtp.bind(authController));
router.post("/reset-password", auth_middleware_1.authMiddleware.verifyAccessToken, authController.resetPassword.bind(authController));
router.post("/forgot-password", authController.forgotPassword.bind(authController));
router.post("/logout", authController.logout.bind(authController));
exports.default = router;
