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
exports.WishlistRepository = void 0;
// src/repositories/WishlistRepository.ts
const Wishlist_1 = require("../models/Wishlist");
const base_repository_1 = require("./base.repository");
const mongoose_1 = require("mongoose");
class WishlistRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Wishlist_1.Wishlist);
    }
    addToWishlist(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userObjectId = new mongoose_1.Types.ObjectId(userId);
                const courseObjectId = new mongoose_1.Types.ObjectId(courseId);
                const existingWishlistItem = yield this.findOne({
                    userId: userObjectId,
                    courseId: courseObjectId,
                });
                if (existingWishlistItem) {
                    throw new Error("Course already in wishlist");
                }
                const wishlistItem = yield this.create({
                    userId: userObjectId,
                    courseId: courseObjectId,
                    addedAt: new Date(),
                });
                const populatedWishlistItem = yield this.findById(wishlistItem._id, "courseId");
                if (!populatedWishlistItem) {
                    throw new Error("Failed to retrieve newly created wishlist item");
                }
                return populatedWishlistItem
                    .courseId;
            }
            catch (error) {
                console.error("Error adding to wishlist:", error);
                throw error instanceof Error
                    ? error
                    : new Error("Failed to add to wishlist");
            }
        });
    }
    removeFromWishlist(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userObjectId = new mongoose_1.Types.ObjectId(userId);
                const courseObjectId = new mongoose_1.Types.ObjectId(courseId);
                const result = yield this.model
                    .findOneAndDelete({ userId: userObjectId, courseId: courseObjectId })
                    .exec();
                if (!result) {
                    throw new Error("Wishlist item not found");
                }
            }
            catch (error) {
                console.error("Error removing from wishlist:", error);
                throw error instanceof Error
                    ? error
                    : new Error("Failed to remove from wishlist");
            }
        });
    }
    getWishlist(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userObjectId = new mongoose_1.Types.ObjectId(userId);
                const wishlistItems = yield this.model
                    .find({ userId: userObjectId })
                    .populate("courseId")
                    .exec();
                if (!wishlistItems || wishlistItems.length === 0) {
                    return null;
                }
                return wishlistItems.map((item) => item.courseId);
            }
            catch (error) {
                console.error("Error fetching wishlist:", error);
                throw error instanceof Error
                    ? error
                    : new Error("Failed to fetch wishlist");
            }
        });
    }
}
exports.WishlistRepository = WishlistRepository;
