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
exports.AuthController = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const statusCodes_1 = require("../utils/statusCodes");
class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password } = req.body;
                const user = yield this.authService.register(name, email, password);
                (0, responseHandler_1.successResponse)(res, user, "OTP sent successfully", statusCodes_1.HttpStatus.CREATED);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || 400);
            }
        });
    }
    sendOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const data = yield this.authService.sendOtp(email);
                (0, responseHandler_1.successResponse)(res, data, "OTP sent successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || 400);
            }
        });
    }
    verifyOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = req.body;
                const data = yield this.authService.verifyOtp(email, otp);
                (0, responseHandler_1.successResponse)(res, data, "OTP verified successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || 400);
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const data = yield this.authService.login(email, password);
                (0, responseHandler_1.successResponse)(res, data, "Login successful", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || 400);
            }
        });
    }
    googleAuth(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.body;
                const data = yield this.authService.authenticateGoogleUser(token);
                (0, responseHandler_1.successResponse)(res, data, "Google Login Successful", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode);
            }
        });
    }
    refreshToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.body;
                const tokens = yield this.authService.refreshAccessToken(refreshToken);
                (0, responseHandler_1.successResponse)(res, tokens, "Token refreshed successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || statusCodes_1.HttpStatus.UNAUTHORIZED);
            }
        });
    }
    resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { curPassword, newPassword } = req.body;
                if (!req.user) {
                    (0, responseHandler_1.errorResponse)(res, "Unauthorized", statusCodes_1.HttpStatus.UNAUTHORIZED);
                    return;
                }
                const result = yield this.authService.changePassword({
                    userId: req.user.id,
                    curPassword,
                    newPassword,
                });
                (0, responseHandler_1.successResponse)(res, null, "Password changed successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || 400);
            }
        });
    }
    forgotPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp, newPassword } = req.body;
                const result = yield this.authService.changePassword({
                    email,
                    otp,
                    newPassword,
                });
                (0, responseHandler_1.successResponse)(res, result, "Password changed successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || 400);
            }
        });
    }
    logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.body;
                const result = yield this.authService.logout(userId);
                (0, responseHandler_1.successResponse)(res, result, "Logged out successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || 400);
            }
        });
    }
}
exports.AuthController = AuthController;
