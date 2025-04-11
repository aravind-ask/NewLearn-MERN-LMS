// src/repositories/CartRepository.ts
import { CartModel, ICart, ICartItem, IPopulatedCart } from "../models/Cart";
import { ICartRepository } from "./interfaces/ICartRepository";
import { BaseRepository } from "./base.repository";
import { Types } from "mongoose";

export class CartRepository
  extends BaseRepository<ICart>
  implements ICartRepository
{
  constructor() {
    super(CartModel);
  }

  async findByUserId(userId: string): Promise<IPopulatedCart | null> {
    try {
      return (await this.findOne(
        { userId: new Types.ObjectId(userId) },
        "items.course"
      )) as IPopulatedCart | null;
    } catch (error) {
      console.error("Error finding cart by user ID:", error);
      throw new Error("Failed to find cart by user ID");
    }
  }

  async addItem(userId: string, item: ICartItem): Promise<ICart> {
    try {
      const populatedCart = await this.findByUserId(userId);
      let cart: ICart;

      if (!populatedCart) {
        cart = await this.create({
          userId: new Types.ObjectId(userId),
          items: [],
          updatedAt: new Date(),
        });
      } else {
        const cartDoc = await this.model.findById(populatedCart._id).exec();
        if (!cartDoc) {
          throw new Error("Cart not found after fetch");
        }
        cart = cartDoc;
      }

      cart.items.push(item);
      cart.updatedAt = new Date();
      return await cart.save();
    } catch (error) {
      console.error("Error adding item to cart:", error);
      throw new Error("Failed to add item to cart");
    }
  }

  async removeItem(userId: string, courseId: string): Promise<ICart> {
    try {
      const populatedCart = await this.findByUserId(userId);
      if (!populatedCart) {
        throw new Error("Cart not found");
      }

      const cart = await this.model.findById(populatedCart._id).exec();
      if (!cart) {
        throw new Error("Cart not found");
      }

      cart.items = cart.items.filter(
        (item) => !item.course.equals(new Types.ObjectId(courseId))
      );
      cart.updatedAt = new Date();
      return await cart.save();
    } catch (error) {
      console.error("Error removing item from cart:", error);
      throw new Error("Failed to remove item from cart");
    }
  }
}
