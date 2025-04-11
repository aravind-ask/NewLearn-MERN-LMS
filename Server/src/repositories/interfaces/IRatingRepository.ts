// src/repositories/interfaces/IRatingRepository.ts
import { IRating } from "../../models/Ratings";

export interface IRatingRepository {
  getReviewsByCourseId(
    courseId: string,
    limit: number,
    offset: number
  ): Promise<{ reviews: IRating[]; total: number }>;
  getReviewById(reviewId: string): Promise<IRating | null>;
  createReview(reviewData: {
    userId: string;
    courseId: string;
    userName: string;
    rating: number;
    comment: string;
  }): Promise<IRating>;
  updateReview(
    reviewId: string,
    updateData: Partial<IRating>
  ): Promise<IRating | null>;
  deleteReview(reviewId: string): Promise<IRating | null>;
}
