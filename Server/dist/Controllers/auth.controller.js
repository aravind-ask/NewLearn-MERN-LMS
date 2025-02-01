"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
const responseHandler_1 = require("../utils/responseHandler");
exports.authController = {
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.body);
                const { name, email, password } = req.body;
                const user = yield auth_service_1.authService.register(name, email, password);
                (0, responseHandler_1.successResponse)(res, user, "otp send successfully", 201);
            }
            catch (error) {
                console.log(error);
                res.status(400).json({ message: error.message });
            }
        });
    },
    verifyOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = req.body;
                const data = yield auth_service_1.authService.verifyOtp(email, otp);
                res.status(200).json(data);
            }
            catch (error) {
                console.log(error);
                res.status(400).json({ message: error.message });
            }
        });
    },
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const data = yield auth_service_1.authService.login(email, password);
                (0, responseHandler_1.successResponse)(res, data, "login successfully", 200);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    },
    googleAuth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.body;
                const data = yield auth_service_1.authService.authenticateGoogleUser(token);
                res.json({
                    success: true,
                    message: "Google Login Successful",
                    data,
                });
            }
            catch (error) {
                console.error("Google Auth Error:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    },
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.body;
                const token = yield auth_service_1.authService.refreshAccessToken(refreshToken);
                res.status(200).json(token);
            }
            catch (error) {
                res.status(401).json({ message: error.message });
            }
        });
    },
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.body;
                const result = yield auth_service_1.authService.logout(userId);
                res.status(200).json(result);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    },
};
