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
const Ratings_1 = __importDefault(require("../models/Ratings"));
const base_repository_1 = require("./base.repository");
class RatingRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Ratings_1.default);
    }
    getReviewsByCourseId(courseId, limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = offset; // Offset is equivalent to skip in this context
                const [reviews, total] = yield Promise.all([
                    this.model.find({ courseId }).skip(skip).limit(limit).lean().exec(),
                    this.model.countDocuments({ courseId }),
                ]);
                return { reviews, total };
            }
            catch (error) {
                console.error("Error fetching reviews by course ID:", error);
                throw new Error("Failed to fetch reviews by course ID");
            }
        });
    }
    getReviewById(reviewId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.findById(reviewId);
            }
            catch (error) {
                console.error("Error finding review by ID:", error);
                throw new Error("Failed to find review by ID");
            }
        });
    }
    createReview(reviewData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.create(reviewData);
            }
            catch (error) {
                console.error("Error creating review:", error);
                throw new Error("Failed to create review");
            }
        });
    }
    updateReview(reviewId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.update(reviewId, updateData);
            }
            catch (error) {
                console.error("Error updating review:", error);
                throw new Error("Failed to update review");
            }
        });
    }
    deleteReview(reviewId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.delete(reviewId);
            }
            catch (error) {
                console.error("Error deleting review:", error);
                throw new Error("Failed to delete review");
            }
        });
    }
}
exports.default = RatingRepository;
