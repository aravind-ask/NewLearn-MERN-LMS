// src/services/interfaces/IRatingService.ts
import { IRating } from "../../models/Ratings";

export interface IRatingService {
  getReviewsByCourseId(
    courseId: string,
    limit: number,
    offset: number
  ): Promise<{ reviews: IRating[]; total: number }>;
  createReview(reviewData: {
    userId: string;
    courseId: string;
    userName: string;
    rating: number;
    comment: string;
  }): Promise<IRating>;
  updateReview(
    reviewId: string,
    updateData: { rating?: number; comment?: string }
  ): Promise<IRating | null>;
  deleteReview(reviewId: string): Promise<void>;
}
