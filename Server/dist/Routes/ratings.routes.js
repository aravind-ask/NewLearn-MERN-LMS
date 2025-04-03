"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ratings_controller_1 = __importDefault(require("../Controllers/ratings.controller"));
const router = express_1.default.Router();
const ratingsController = new ratings_controller_1.default();
router.get("/:courseId", (req, res) => ratingsController.getReviewsByCourseId(req, res));
router.post("/", (req, res) => ratingsController.createReview(req, res));
router.put("/:reviewId", (req, res) => ratingsController.updateReview(req, res));
router.delete("/:reviewId", (req, res) => ratingsController.deleteReview(req, res));
exports.default = router;
