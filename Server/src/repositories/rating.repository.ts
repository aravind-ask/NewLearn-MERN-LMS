import { IRating } from "../models/Ratings";
import Rating from "../models/Ratings";

export default class RatingRepository {
  async getReviewsByCourseId(
    courseId: string,
    limit: number,
    offset: number
  ): Promise<{ reviews: IRating[]; total: number }> {
    const [reviews, total] = await Promise.all([
      Rating.find({ courseId }).skip(offset).limit(limit).lean().exec(),
      Rating.countDocuments({ courseId }),
    ]);
    return { reviews, total };
  }

  async getReviewById(reviewId: string): Promise<IRating | null> {
    return await Rating.findById(reviewId).exec();
  }

  async createReview(reviewData: {
    userId: string;
    courseId: string;
    userName: string;
    rating: number;
    comment: string;
  }): Promise<IRating> {
    const review = new Rating(reviewData);
    return await review.save();
  }

  async updateReview(
    reviewId: string,
    updateData: { rating?: number; comment?: string }
  ): Promise<IRating | null> {
    return await Rating.findByIdAndUpdate(reviewId, updateData, {
      new: true,
    }).exec();
  }

  async deleteReview(reviewId: string): Promise<void> {
    await Rating.findByIdAndDelete(reviewId).exec();
  }
}
