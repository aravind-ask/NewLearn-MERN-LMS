import { Course } from "../../types/types";

export interface ICartService {
  addToCart(userId: string, courseId: string): Promise<Course>;
  removeFromCart(userId: string, courseId: string): Promise<void>;
  getCart(userId: string): Promise<Course[]>;
}
