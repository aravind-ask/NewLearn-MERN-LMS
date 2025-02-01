"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../Controllers/auth.controller");
const router = express_1.default.Router();
router.post("/register", auth_controller_1.authController.register);
router.post("/verify-otp", auth_controller_1.authController.verifyOtp);
router.post("/login", auth_controller_1.authController.login);
router.post("/google-auth", auth_controller_1.authController.googleAuth);
router.post("/refresh-token", auth_controller_1.authController.refreshToken);
router.post("/logout", auth_controller_1.authController.logout);
exports.default = router;
