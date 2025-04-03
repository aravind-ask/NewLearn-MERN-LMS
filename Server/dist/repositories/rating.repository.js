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
class RatingRepository {
    getReviewsByCourseId(courseId, limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            const [reviews, total] = yield Promise.all([
                Ratings_1.default.find({ courseId }).skip(offset).limit(limit).lean().exec(),
                Ratings_1.default.countDocuments({ courseId }),
            ]);
            return { reviews, total };
        });
    }
    getReviewById(reviewId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Ratings_1.default.findById(reviewId).exec();
        });
    }
    createReview(reviewData) {
        return __awaiter(this, void 0, void 0, function* () {
            const review = new Ratings_1.default(reviewData);
            return yield review.save();
        });
    }
    updateReview(reviewId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Ratings_1.default.findByIdAndUpdate(reviewId, updateData, {
                new: true,
            }).exec();
        });
    }
    deleteReview(reviewId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Ratings_1.default.findByIdAndDelete(reviewId).exec();
        });
    }
}
exports.default = RatingRepository;
