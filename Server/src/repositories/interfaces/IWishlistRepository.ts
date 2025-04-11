// src/repositories/interfaces/IWishlistRepository.ts
import { Course } from "../../types/types";

export interface IWishlistRepository {
  addToWishlist(userId: string, courseId: string): Promise<Course>;
  removeFromWishlist(userId: string, courseId: string): Promise<void>;
  getWishlist(userId: string): Promise<Course[] | null>;
}
