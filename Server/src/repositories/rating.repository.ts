// src/repositories/RatingRepository.ts
import { IRating } from "../models/Ratings";
import Rating from "../models/Ratings";
import { BaseRepository } from "./base.repository";
import { IRatingRepository } from "./interfaces/IRatingRepository";

export default class RatingRepository
  extends BaseRepository<IRating>
  implements IRatingRepository
{
  constructor() {
    super(Rating);
  }

  async getReviewsByCourseId(
    courseId: string,
    limit: number,
    offset: number
  ): Promise<{ reviews: IRating[]; total: number }> {
    try {
      const skip = offset; // Offset is equivalent to skip in this context
      const [reviews, total] = await Promise.all([
        this.model.find({ courseId }).skip(skip).limit(limit).lean().exec(),
        this.model.countDocuments({ courseId }),
      ]);
      return { reviews, total };
    } catch (error) {
      console.error("Error fetching reviews by course ID:", error);
      throw new Error("Failed to fetch reviews by course ID");
    }
  }

  async getReviewById(reviewId: string): Promise<IRating | null> {
    try {
      return await this.findById(reviewId);
    } catch (error) {
      console.error("Error finding review by ID:", error);
      throw new Error("Failed to find review by ID");
    }
  }

  async createReview(reviewData: {
    userId: string;
    courseId: string;
    userName: string;
    rating: number;
    comment: string;
  }): Promise<IRating> {
    try {
      return await this.create(reviewData);
    } catch (error) {
      console.error("Error creating review:", error);
      throw new Error("Failed to create review");
    }
  }

  async updateReview(
    reviewId: string,
    updateData: Partial<IRating>
  ): Promise<IRating | null> {
    try {
      return await this.update(reviewId, updateData);
    } catch (error) {
      console.error("Error updating review:", error);
      throw new Error("Failed to update review");
    }
  }

  async deleteReview(reviewId: string): Promise<IRating | null> {
    try {
      return await this.delete(reviewId);
    } catch (error) {
      console.error("Error deleting review:", error);
      throw new Error("Failed to delete review");
    }
  }
}
