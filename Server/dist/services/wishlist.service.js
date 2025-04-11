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
exports.WishlistService = void 0;
const mongoose_1 = require("mongoose");
class WishlistService {
    constructor(wishlistRepository) {
        this.wishlistRepository = wishlistRepository;
    }
    addToWishlist(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(courseId)) {
                throw new Error("Invalid ID format");
            }
            return yield this.wishlistRepository.addToWishlist(userId, courseId);
        });
    }
    removeFromWishlist(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(courseId)) {
                throw new Error("Invalid ID format");
            }
            yield this.wishlistRepository.removeFromWishlist(userId, courseId);
        });
    }
    getWishlist(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new Error("Invalid user ID");
            }
            return yield this.wishlistRepository.getWishlist(userId);
        });
    }
}
exports.WishlistService = WishlistService;
exports.default = WishlistService;
