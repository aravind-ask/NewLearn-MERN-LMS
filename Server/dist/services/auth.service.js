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
exports.AuthService = void 0;
const tokenUtils_1 = require("../utils/tokenUtils");
const hashUtils_1 = require("../utils/hashUtils");
const emailUtils_1 = require("../utils/emailUtils");
const google_auth_library_1 = require("google-auth-library");
const appError_1 = require("../utils/appError");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
class AuthService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    register(name, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.userRepo.findUserByEmail(email);
            if (existingUser)
                throw new appError_1.AppError("User already exists", 409);
            const hashedPassword = yield (0, hashUtils_1.hashPassword)(password);
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            const user = yield this.userRepo.createUser({
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpires,
            });
            yield (0, emailUtils_1.sendOTPEmail)(email, otp);
            return user;
        });
    }
    sendOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepo.findUserByEmail(email);
            if (!user)
                throw new appError_1.AppError("User not found", 404);
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            yield this.userRepo.updateUser(user.id, { otp, otpExpires });
            yield (0, emailUtils_1.sendOTPEmail)(email, otp);
            return { message: "OTP sent successfully" };
        });
    }
    verifyOtp(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepo.findUserByEmail(email);
            if (!user || user.otp !== otp || new Date() > user.otpExpires) {
                throw new appError_1.AppError("Invalid or expired OTP", 400);
            }
            yield this.userRepo.updateUser(user.id, {
                isVerified: true,
                otp: undefined,
                otpExpires: undefined,
            });
            return { message: "Email verified successfully" };
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepo.findUserByEmail(email);
            if (!user)
                throw new appError_1.AppError("Invalid credentials", 400);
            if (user.isBlocked)
                throw new appError_1.AppError("User is blocked", 403);
            const isPasswordValid = yield (0, hashUtils_1.comparePassword)(password, user.password);
            if (!isPasswordValid)
                throw new appError_1.AppError("Invalid credentials", 400);
            const accessToken = tokenUtils_1.tokenUtils.generateAccessToken({
                userId: user._id,
                role: user.role,
            });
            const refreshToken = tokenUtils_1.tokenUtils.generateRefreshToken({ userId: user._id });
            yield this.userRepo.updateRefreshToken(user._id, refreshToken);
            return {
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    photoUrl: user.photoUrl,
                    bio: user.bio,
                    phoneNumber: user.phoneNumber,
                    address: user.address,
                    dateOfBirth: user.dateOfBirth,
                    education: user.education,
                    isBlocked: user.isBlocked,
                },
            };
        });
    }
    authenticateGoogleUser(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = yield client
                .verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            })
                .then((ticket) => ticket.getPayload());
            if (!payload)
                throw new appError_1.AppError("Invalid Google Token", 401);
            const { sub, email, name, picture } = payload;
            let user = yield this.userRepo.findUserByEmail(email);
            if (!user) {
                user = yield this.userRepo.createUser({
                    googleId: sub,
                    email,
                    name,
                    photoUrl: picture,
                    role: "student",
                    isVerified: true, // Google users are auto-verified
                });
            }
            if (user.isBlocked)
                throw new appError_1.AppError("User is blocked", 403);
            const accessToken = tokenUtils_1.tokenUtils.generateAccessToken({
                userId: user._id,
                role: user.role,
            });
            const refreshToken = tokenUtils_1.tokenUtils.generateRefreshToken({ userId: user._id });
            yield this.userRepo.updateRefreshToken(user._id, refreshToken);
            return {
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    photoUrl: user.photoUrl,
                    isBlocked: user.isBlocked,
                },
            };
        });
    }
    refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = tokenUtils_1.tokenUtils.verifyRefreshToken(refreshToken);
            const user = yield this.userRepo.findUserById(decoded.userId);
            if (!user || user.refreshToken !== refreshToken) {
                throw new appError_1.AppError("Invalid refresh token", 401);
            }
            const accessToken = tokenUtils_1.tokenUtils.generateAccessToken({
                userId: user._id,
                role: user.role,
            });
            return { accessToken, refreshToken };
        });
    }
    changePassword(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, email, curPassword, newPassword, otp } = data;
            let user;
            if (userId) {
                user = yield this.userRepo.findUserById(userId);
            }
            else if (email) {
                user = yield this.userRepo.findUserByEmail(email);
            }
            if (!user)
                throw new appError_1.AppError("User not found", 404);
            if (otp) {
                if (user.otp !== otp || new Date() > user.otpExpires) {
                    throw new appError_1.AppError("Invalid or expired OTP", 400);
                }
            }
            else if (curPassword) {
                const isPasswordValid = yield (0, hashUtils_1.comparePassword)(curPassword, user.password);
                if (!isPasswordValid)
                    throw new appError_1.AppError("Invalid current password", 400);
            }
            else {
                throw new appError_1.AppError("Current password or OTP required", 400);
            }
            const hashedPassword = yield (0, hashUtils_1.hashPassword)(newPassword);
            yield this.userRepo.updateUser(user._id, {
                password: hashedPassword,
                otp: undefined,
                otpExpires: undefined,
            });
            return { message: "Password updated successfully" };
        });
    }
    logout(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepo.findUserById(userId);
            if (!user)
                throw new appError_1.AppError("User not found", 404);
            yield this.userRepo.updateRefreshToken(user._id, ""); // Clear refresh token
            return { message: "Logged out successfully" };
        });
    }
}
exports.AuthService = AuthService;
exports.default = AuthService; // Export as class for DI
