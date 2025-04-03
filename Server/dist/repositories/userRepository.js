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
exports.UserRepository = void 0;
// src/repositories/userRepository.ts
const User_1 = require("../models/User");
class UserRepository {
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = new User_1.User(userData);
                return yield user.save();
            }
            catch (error) {
                throw new Error("Error creating user");
            }
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield User_1.User.findOne({ email }).exec();
            }
            catch (error) {
                throw new Error("Error finding user by email");
            }
        });
    }
    findUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield User_1.User.findById(userId).exec();
            }
            catch (error) {
                throw new Error("Error finding user by ID");
            }
        });
    }
    updateRefreshToken(userId, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield User_1.User.findByIdAndUpdate(userId, { refreshToken }, { new: true }).exec();
            }
            catch (error) {
                throw new Error("Error updating refresh token");
            }
        });
    }
    getAllUsers(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const users = yield User_1.User.find({ role: { $ne: "admin" } }, "id name email role photoUrl isBlocked")
                    .skip(skip)
                    .limit(limit)
                    .exec();
                const totalUsers = yield User_1.User.countDocuments({ role: { $ne: "admin" } });
                const totalPages = Math.ceil(totalUsers / limit);
                return { users, totalPages };
            }
            catch (error) {
                throw new Error("Error fetching users");
            }
        });
    }
    updateUser(userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield User_1.User.findByIdAndUpdate(userId, updateData, {
                    new: true,
                }).exec();
            }
            catch (error) {
                throw new Error("Error updating user");
            }
        });
    }
    toggleBlockUser(userId, isBlocked) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield User_1.User.findByIdAndUpdate(userId, { isBlocked }, { new: true }).exec();
            }
            catch (error) {
                throw new Error("Error toggling block status");
            }
        });
    }
    updateUserRole(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield User_1.User.findByIdAndUpdate(userId, { role }, { new: true }).exec();
            }
            catch (error) {
                throw new Error("Error updating user role");
            }
        });
    }
}
exports.UserRepository = UserRepository;
