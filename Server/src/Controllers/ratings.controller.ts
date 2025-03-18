import { Request, Response } from "express";
import RatingService from "../services/rating.service";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { HttpStatus } from "../utils/statusCodes";

export default class RatingController {
  private ratingService: RatingService;

  constructor() {
    this.ratingService = new RatingService();
  }

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
        HttpStatus.OK
      );
    } catch (error: any) {
      errorResponse(
        res,
        error.message || "Failed to fetch reviews",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

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
      res.status(HttpStatus.CREATED).json(review);
    } catch (error: any) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  async updateReview(req: Request, res: Response) {
    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const updatedReview = await this.ratingService.updateReview(reviewId, {
        rating,
        comment,
      });
      res.status(HttpStatus.OK).json(updatedReview);
    } catch (error: any) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  async deleteReview(req: Request, res: Response) {
    try {
      const { reviewId } = req.params;
      await this.ratingService.deleteReview(reviewId);
      res.status(HttpStatus.OK).send();
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }
}
