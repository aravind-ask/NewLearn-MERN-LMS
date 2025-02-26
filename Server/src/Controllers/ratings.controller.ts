import { Request, Response } from "express";
import RatingService from "../services/rating.service";

export default class RatingController {
  private ratingService: RatingService;

  constructor() {
    this.ratingService = new RatingService();
  }

  // Get all reviews for a course
  async getReviewsByCourseId(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const reviews = await this.ratingService.getReviewsByCourseId(courseId);
      res.status(200).json(reviews);
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ message: error.message });
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
