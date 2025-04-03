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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const customError_1 = require("../utils/customError");
class UserService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    updateProfile(userId, name, email, password, photoUrl, bio, phoneNumber, address, dateOfBirth, education) {
        return __awaiter(this, void 0, void 0, function* () {
            const updates = {};
            if (name)
                updates.name = name;
            if (email)
                updates.email = email;
            if (password)
                updates.password = yield bcryptjs_1.default.hash(password, 10);
            if (photoUrl)
                updates.photoUrl = photoUrl;
            if (bio)
                updates.bio = bio;
            if (phoneNumber)
                updates.phoneNumber = phoneNumber;
            if (address)
                updates.address = address;
            if (dateOfBirth)
                updates.dateOfBirth = dateOfBirth;
            if (education)
                updates.education = education;
            const updatedUser = yield this.userRepo.updateUser(userId, updates);
            if (!updatedUser)
                throw new customError_1.NotFoundError("User not found");
            return updatedUser;
        });
    }
    getUsers(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepo.getAllUsers(page, limit);
        });
    }
    blockUser(userId, isBlocked) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield this.userRepo.toggleBlockUser(userId, isBlocked);
            if (!updatedUser)
                throw new customError_1.NotFoundError("User not found");
            return updatedUser;
        });
    }
    getUserStatus(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepo.findUserById(userId);
            if (!user)
                throw new customError_1.NotFoundError("User not found");
            return user;
        });
    }
}
exports.UserService = UserService;
exports.default = UserService; // Keep as a class for DI, not instantiated here
