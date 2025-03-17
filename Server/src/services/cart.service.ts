// src/services/cart.service.ts
import { ICartRepository } from "../repositories/interfaces/ICartRepository";
import { ICart, ICartItem, IPopulatedCart } from "../models/Cart";
import { Types } from "mongoose";

export class CartService {
  constructor(private cartRepository: ICartRepository) {}

  async addToCart(userId: string, item: ICartItem): Promise<ICart> {
    // Basic validation
    if (
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(item.course.toString())
    ) {
      throw new Error("Invalid ID format");
    }

    if (
      item.offer &&
      (!item.offer._id ||
        !item.offer.title ||
        !item.offer.description ||
        item.offer.discountPercentage === undefined)
    ) {
      throw new Error("Invalid offer format");
    }

    return this.cartRepository.addItem(userId, item);
  }

  async removeFromCart(userId: string, courseId: string): Promise<ICart> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(courseId)) {
      throw new Error("Invalid ID format");
    }

    return this.cartRepository.removeItem(userId, courseId);
  }

  async getCart(userId: string): Promise<IPopulatedCart | null> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    return this.cartRepository.findByUserId(userId);
  }
}
