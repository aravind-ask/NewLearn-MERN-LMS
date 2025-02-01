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
const userRepository_1 = require("../repositories/userRepository");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserService {
    updateProfile(userId, name, email, password, profilePic) {
        return __awaiter(this, void 0, void 0, function* () {
            const updates = {};
            if (name)
                updates.name = name;
            if (email)
                updates.email = email;
            if (password)
                updates.password = yield bcryptjs_1.default.hash(password, 10);
            if (profilePic)
                updates.profilePic = profilePic;
            return yield userRepository_1.userRepository.updateUser(userId, updates);
        });
    }
}
exports.default = new UserService();
