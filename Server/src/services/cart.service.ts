import * as cartRepository from "../repositories/cart.repository";
import { Course } from "../types/types";

export const addToCart = async (
  userId: string,
  courseId: string
): Promise<Course> => {
  return await cartRepository.addToCart(userId, courseId);
};

export const removeFromCart = async (
  userId: string,
  courseId: string
): Promise<void> => {
  await cartRepository.removeFromCart(userId, courseId);
};

export const getCart = async (userId: string): Promise<Course[]> => {
  return await cartRepository.getCart(userId);
};
