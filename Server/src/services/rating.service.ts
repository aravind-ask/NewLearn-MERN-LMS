import RatingRepository from "../repositories/rating.repository";
import { IRating } from "../models/Ratings";

export default class RatingService {
  private ratingRepository: RatingRepository;

  constructor() {
    this.ratingRepository = new RatingRepository();
  }

  // Get all reviews for a course
  async getReviewsByCourseId(courseId: string): Promise<IRating[]> {
    return await this.ratingRepository.getReviewsByCourseId(courseId);
  }

  // Create a new review
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

  // Update a review
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

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    await this.ratingRepository.deleteReview(reviewId);
  }
}
