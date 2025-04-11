// src/services/WishlistService.ts
import { IWishlistRepository } from "../repositories/interfaces/IWishlistRepository";
import { IWishlistService } from "./interfaces/IWishlistService";
import { Course } from "../types/types";
import { Types } from "mongoose";

export class WishlistService implements IWishlistService {
  constructor(private wishlistRepository: IWishlistRepository) {}

  async addToWishlist(userId: string, courseId: string): Promise<Course> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(courseId)) {
      throw new Error("Invalid ID format");
    }

    return await this.wishlistRepository.addToWishlist(userId, courseId);
  }

  async removeFromWishlist(userId: string, courseId: string): Promise<void> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(courseId)) {
      throw new Error("Invalid ID format");
    }

    await this.wishlistRepository.removeFromWishlist(userId, courseId);
  }

  async getWishlist(userId: string): Promise<Course[] | null> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    return await this.wishlistRepository.getWishlist(userId);
  }
}

export default WishlistService;
