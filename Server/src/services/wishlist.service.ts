import * as wishlistRepository from "../repositories/wishlist.repository";
import { Course } from "../types/types";

export const addToWishlist = async (
  userId: string,
  courseId: string
): Promise<Course> => {
  return await wishlistRepository.addToWishlist(userId, courseId);
};

export const removeFromWishlist = async (
  userId: string,
  courseId: string
): Promise<void> => {
  await wishlistRepository.removeFromWishlist(userId, courseId);
};

export const getWishlist = async (userId: string): Promise<Course[]> => {
  return await wishlistRepository.getWishlist(userId);
};
