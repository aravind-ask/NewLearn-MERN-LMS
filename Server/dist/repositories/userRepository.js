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
// src/repositories/UserRepository.ts
const User_1 = require("../models/User");
const base_repository_1 = require("./base.repository");
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(User_1.User);
    }
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.create(userData);
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.model.findOne({ email }).exec();
            }
            catch (error) {
                throw new Error("Error finding user by email");
            }
        });
    }
    findUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findById(userId);
        });
    }
    updateRefreshToken(userId, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.update(userId, { refreshToken });
        });
    }
    getAllUsers(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = { role: { $ne: "admin" } };
                if (search) {
                    query.$or = [
                        { name: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } },
                    ];
                }
                const result = yield this.findAll(page, limit, query);
                return {
                    users: result.items,
                    totalPages: result.totalPages,
                };
            }
            catch (error) {
                throw new Error("Error fetching users");
            }
        });
    }
    updateUser(userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.update(userId, updateData);
        });
    }
    toggleBlockUser(userId, isBlocked) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.update(userId, { isBlocked });
        });
    }
    updateUserRole(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.update(userId, { role });
        });
    }
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.delete(userId);
        });
    }
}
exports.UserRepository = UserRepository;
