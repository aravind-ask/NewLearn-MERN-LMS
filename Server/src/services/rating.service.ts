// src/services/RatingService.ts
import RatingRepository from "../repositories/rating.repository";
import { IRating } from "../models/Ratings";
import { IRatingService } from "./interfaces/IRatingService";
import { IRatingRepository } from "../repositories/interfaces/IRatingRepository";

export default class RatingService implements IRatingService {
  private ratingRepository: IRatingRepository;

  constructor() {
    this.ratingRepository = new RatingRepository();
  }

  async getReviewsByCourseId(
    courseId: string,
    limit: number,
    offset: number
  ): Promise<{ reviews: IRating[]; total: number }> {
    if (!courseId) throw new Error("Course ID is required");
    if (limit < 1 || offset < 0)
      throw new Error("Invalid pagination parameters");
    return await this.ratingRepository.getReviewsByCourseId(
      courseId,
      limit,
      offset
    );
  }

  async createReview(reviewData: {
    userId: string;
    courseId: string;
    userName: string;
    rating: number;
    comment: string;
  }): Promise<IRating> {
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error("Rating must be between 1 and 5.");
    }
    if (!reviewData.comment.trim()) {
      throw new Error("Comment cannot be empty.");
    }
    return await this.ratingRepository.createReview(reviewData);
  }

  async updateReview(
    reviewId: string,
    updateData: { rating?: number; comment?: string }
  ): Promise<IRating | null> {
    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
      throw new Error("Rating must be between 1 and 5.");
    }
    if (updateData.comment && !updateData.comment.trim()) {
      throw new Error("Comment cannot be empty.");
    }
    return await this.ratingRepository.updateReview(reviewId, updateData);
  }

  async deleteReview(reviewId: string): Promise<void> {
    const result = await this.ratingRepository.deleteReview(reviewId);
    if (!result) {
      throw new Error("Review not found");
    }
  }
}
