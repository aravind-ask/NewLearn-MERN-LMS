// src/repositories/WishlistRepository.ts
import { Wishlist, IWishlist } from "../models/Wishlist";
import { Course } from "../types/types";
import { BaseRepository } from "./base.repository";
import { IWishlistRepository } from "./interfaces/IWishlistRepository";
import { Types } from "mongoose";

export class WishlistRepository
  extends BaseRepository<IWishlist>
  implements IWishlistRepository
{
  constructor() {
    super(Wishlist);
  }

  async addToWishlist(userId: string, courseId: string): Promise<Course> {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const courseObjectId = new Types.ObjectId(courseId);

      const existingWishlistItem = await this.findOne({
        userId: userObjectId,
        courseId: courseObjectId,
      });
      if (existingWishlistItem) {
        throw new Error("Course already in wishlist");
      }

      const wishlistItem = await this.create({
        userId: userObjectId,
        courseId: courseObjectId,
        addedAt: new Date(),
      });
      const populatedWishlistItem = await this.findById(
        wishlistItem._id as string,
        "courseId"
      );
      if (!populatedWishlistItem) {
        throw new Error("Failed to retrieve newly created wishlist item");
      }

      return (populatedWishlistItem as IWishlist & { courseId: Course })
        .courseId;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to add to wishlist");
    }
  }

  async removeFromWishlist(userId: string, courseId: string): Promise<void> {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const courseObjectId = new Types.ObjectId(courseId);

      const result = await this.model
        .findOneAndDelete({ userId: userObjectId, courseId: courseObjectId })
        .exec();
      if (!result) {
        throw new Error("Wishlist item not found");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to remove from wishlist");
    }
  }

  async getWishlist(userId: string): Promise<Course[] | null> {
    try {
      const userObjectId = new Types.ObjectId(userId);

      const wishlistItems = await this.model
        .find({ userId: userObjectId })
        .populate<{ courseId: Course }>("courseId")
        .exec();
      if (!wishlistItems || wishlistItems.length === 0) {
        return null;
      }

      return wishlistItems.map((item) => item.courseId);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to fetch wishlist");
    }
  }
}
