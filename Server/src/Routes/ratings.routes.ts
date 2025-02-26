import express from "express";
import RatingsController from "../Controllers/ratings.controller";

const router = express.Router();
const ratingsController = new RatingsController();

router.get("/:courseId", (req, res) =>
  ratingsController.getReviewsByCourseId(req, res)
);

router.post("/", (req, res) => ratingsController.createReview(req, res));

router.put("/:reviewId", (req, res) =>
  ratingsController.updateReview(req, res)
);

router.delete("/:reviewId", (req, res) =>
  ratingsController.deleteReview(req, res)
);

export default router;
