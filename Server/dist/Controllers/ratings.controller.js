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
const rating_service_1 = __importDefault(require("../services/rating.service"));
const responseHandler_1 = require("../utils/responseHandler");
const statusCodes_1 = require("../utils/statusCodes");
class RatingController {
    constructor() {
        this.ratingService = new rating_service_1.default();
    }
    getReviewsByCourseId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId } = req.params;
                const limit = parseInt(req.query.limit) || 5;
                const offset = parseInt(req.query.offset) || 0;
                const { reviews, total } = yield this.ratingService.getReviewsByCourseId(courseId, limit, offset);
                (0, responseHandler_1.successResponse)(res, { reviews, total }, "Reviews fetched successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message || "Failed to fetch reviews", error.status || statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
    createReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, courseId, userName, rating, comment } = req.body;
                const review = yield this.ratingService.createReview({
                    userId,
                    courseId,
                    userName,
                    rating,
                    comment,
                });
                res.status(statusCodes_1.HttpStatus.CREATED).json(review);
            }
            catch (error) {
                res.status(statusCodes_1.HttpStatus.BAD_REQUEST).json({ message: error.message });
            }
        });
    }
    updateReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { reviewId } = req.params;
                const { rating, comment } = req.body;
                const updatedReview = yield this.ratingService.updateReview(reviewId, {
                    rating,
                    comment,
                });
                res.status(statusCodes_1.HttpStatus.OK).json(updatedReview);
            }
            catch (error) {
                res.status(statusCodes_1.HttpStatus.BAD_REQUEST).json({ message: error.message });
            }
        });
    }
    deleteReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { reviewId } = req.params;
                yield this.ratingService.deleteReview(reviewId);
                res.status(statusCodes_1.HttpStatus.OK).send();
            }
            catch (error) {
                res
                    .status(statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ message: error.message });
            }
        });
    }
}
exports.default = RatingController;
