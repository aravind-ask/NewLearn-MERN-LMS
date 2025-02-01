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
exports.authService = void 0;
const userRepository_1 = require("../repositories/userRepository");
const tokenUtils_1 = require("../utils/tokenUtils");
const hashUtils_1 = require("..//utils/hashUtils");
const emailUtils_1 = require("../utils/emailUtils");
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.authService = {
    register(name, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield userRepository_1.userRepository.findUserByEmail(email);
            if (existingUser) {
                throw new Error("User already exists");
            }
            const hashedPassword = yield (0, hashUtils_1.hashPassword)(password);
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            const user = yield userRepository_1.userRepository.createUser({
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpires,
            });
            yield (0, emailUtils_1.sendOTPEmail)(email, otp);
            return user;
        });
    },
    verifyOtp(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository_1.userRepository.findUserByEmail(email);
            if (!user || user.otp !== otp || new Date() > user.otpExpires) {
                throw new Error("Invalid or expired OTP");
            }
            yield userRepository_1.userRepository.updateUser(user.id, {
                isVerified: true,
                otp: undefined,
                otpExpires: undefined,
            });
            return { message: "Email verified successfully" };
        });
    },
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository_1.userRepository.findUserByEmail(email);
            if (!user) {
                throw new Error("Invalid credentials");
            }
            const isPasswordValid = yield (0, hashUtils_1.comparePassword)(password, user.password);
            if (!isPasswordValid) {
                throw new Error("Invalid credentials");
            }
            const accessToken = tokenUtils_1.tokenUtils.generateAccessToken({
                userId: user._id,
                role: user.role,
            });
            const refreshToken = tokenUtils_1.tokenUtils.generateRefreshToken({ userId: user._id });
            yield userRepository_1.userRepository.updateRefreshToken(user._id, refreshToken);
            const data = {
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    photoUrl: user.photoUrl,
                },
            };
            return data;
        });
    },
    verifyGoogleToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticket = yield client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            return ticket.getPayload();
        });
    },
    authenticateGoogleUser(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = yield this.verifyGoogleToken(token);
            if (!payload)
                throw new Error("Invalid Google Token");
            const { sub, email, name, picture } = payload;
            let user = yield userRepository_1.userRepository.findUserByEmail(email);
            if (!user) {
                user = yield userRepository_1.userRepository.createUser({
                    googleId: sub,
                    email,
                    name,
                    photoUrl: picture,
                    role: "student",
                });
            }
            const accessToken = tokenUtils_1.tokenUtils.generateAccessToken({
                userId: user._id,
                role: user.role,
            });
            const refreshToken = tokenUtils_1.tokenUtils.generateRefreshToken({ userId: user._id });
            yield userRepository_1.userRepository.updateRefreshToken(user._id, refreshToken);
            const data = {
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    photoUrl: user.photoUrl,
                },
            };
            return data;
        });
    },
    refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = tokenUtils_1.tokenUtils.verifyRefreshToken(refreshToken);
                const user = yield userRepository_1.userRepository.findUserById(decoded.userId);
                if (!user || user.refreshToken !== refreshToken) {
                    throw new Error("Invalid refresh token");
                }
                const accessToken = tokenUtils_1.tokenUtils.generateAccessToken({
                    userId: user._id,
                    role: user.role,
                });
                return { accessToken };
            }
            catch (error) {
                throw new Error("Invalid refresh token");
            }
        });
    },
    logout(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository_1.userRepository.findUserById(userId);
            if (user) {
                user.refreshToken = undefined;
                yield user.save();
            }
            return { message: "Logged out successfully" };
        });
    },
};
