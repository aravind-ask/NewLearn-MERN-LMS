import { Request, Response } from "express";
import RatingService from "../services/rating.service";
import { errorResponse, successResponse } from "../utils/responseHandler";

export default class RatingController {
  private ratingService: RatingService;

  constructor() {
    this.ratingService = new RatingService();
  }

  // Get all reviews for a course
  async getReviewsByCourseId(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const limit = parseInt(req.query.limit as string) || 5;
      const offset = parseInt(req.query.offset as string) || 0;

      const { reviews, total } = await this.ratingService.getReviewsByCourseId(
        courseId,
        limit,
        offset
      );
      successResponse(
        res,
        { reviews, total },
        "Reviews fetched successfully",
        200
      );
    } catch (error: any) {
      errorResponse(
        res,
        error.message || "Failed to fetch reviews",
        error.status || 500
      );
    }
  }

  // Create a new review
  async createReview(req: Request, res: Response) {
    try {
      const { userId, courseId, userName, rating, comment } = req.body;
      const review = await this.ratingService.createReview({
        userId,
        courseId,
        userName,
        rating,
        comment,
      });
      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update a review
  async updateReview(req: Request, res: Response) {
    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const updatedReview = await this.ratingService.updateReview(reviewId, {
        rating,
        comment,
      });
      res.status(200).json(updatedReview);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete a review
  async deleteReview(req: Request, res: Response) {
    try {
      const { reviewId } = req.params;
      await this.ratingService.deleteReview(reviewId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
