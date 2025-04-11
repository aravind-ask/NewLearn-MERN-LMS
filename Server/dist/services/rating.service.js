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
// src/services/RatingService.ts
const rating_repository_1 = __importDefault(require("../repositories/rating.repository"));
class RatingService {
    constructor() {
        this.ratingRepository = new rating_repository_1.default();
    }
    getReviewsByCourseId(courseId, limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!courseId)
                throw new Error("Course ID is required");
            if (limit < 1 || offset < 0)
                throw new Error("Invalid pagination parameters");
            return yield this.ratingRepository.getReviewsByCourseId(courseId, limit, offset);
        });
    }
    createReview(reviewData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (reviewData.rating < 1 || reviewData.rating > 5) {
                throw new Error("Rating must be between 1 and 5.");
            }
            if (!reviewData.comment.trim()) {
                throw new Error("Comment cannot be empty.");
            }
            return yield this.ratingRepository.createReview(reviewData);
        });
    }
    updateReview(reviewId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
                throw new Error("Rating must be between 1 and 5.");
            }
            if (updateData.comment && !updateData.comment.trim()) {
                throw new Error("Comment cannot be empty.");
            }
            return yield this.ratingRepository.updateReview(reviewId, updateData);
        });
    }
    deleteReview(reviewId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.ratingRepository.deleteReview(reviewId);
            if (!result) {
                throw new Error("Review not found");
            }
        });
    }
}
exports.default = RatingService;
