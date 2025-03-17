import { ICart } from "@/models/Cart";
import { Course } from "../../types/types";
import { ICourse } from "../../models/Course";

interface CourseInCartWithOffer {
  courseId: ICourse;
  discountedPrice?: number;
  appliedOffer?: {
    title: string;
    discountPercentage: number;
  };
}

export interface ICartService {
  getCart(userId: string): Promise<{ data: CourseInCartWithOffer[] }>;
  addToCart(userId: string, courseId: string): Promise<ICart>;
  removeFromCart(userId: string, courseId: string): Promise<ICart>;
}