// src/services/interfaces/IWishlistService.ts
import { Course } from "../../types/types";

export interface IWishlistService {
  addToWishlist(userId: string, courseId: string): Promise<Course>;
  removeFromWishlist(userId: string, courseId: string): Promise<void>;
  getWishlist(userId: string): Promise<Course[] | null>;
}
