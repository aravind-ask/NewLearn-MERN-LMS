// src/repositories/interfaces/ICartRepository.ts
import { ICart } from "../../models/Cart";

export interface ICartRepository {
  addToCart(userId: string, courseId: string): Promise<ICart>;
  findCartItem(userId: string, courseId: string): Promise<ICart | null>;
  removeFromCart(userId: string, courseId: string): Promise<void>;
  getCart(userId: string): Promise<ICart[]>;
}
