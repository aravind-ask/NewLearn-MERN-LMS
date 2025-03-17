
import { CartModel, ICart, ICartItem, IPopulatedCart } from "../models/Cart";
import { ICartRepository } from "./interfaces/ICartRepository";
import { Types } from "mongoose";

export class CartRepository implements ICartRepository {
  async findByUserId(userId: string): Promise<IPopulatedCart | null> {
    return CartModel.findOne({ userId: new Types.ObjectId(userId) })
      .populate("items.course")
      .exec() as Promise<IPopulatedCart | null>;
  }

  async addItem(userId: string, item: ICartItem): Promise<ICart> {
    let cart = (await this.findByUserId(userId)) as ICart | null;

    if (!cart) {
      cart = await this.create(userId);
    }

    cart.items.push(item);
    cart.updatedAt = new Date();
    return cart.save();
  }

  async removeItem(userId: string, courseId: string): Promise<ICart> {
    const cart = (await this.findByUserId(userId)) as ICart | null;
    if (!cart) {
      throw new Error("Cart not found");
    }

    cart.items = cart.items.filter(
      (item) => !item.course.equals(new Types.ObjectId(courseId))
    );
    cart.updatedAt = new Date();
    return cart.save();
  }

  async create(userId: string): Promise<ICart> {
    const cart = new CartModel({
      userId: new Types.ObjectId(userId),
      items: [],
    });
    return cart.save();
  }
}
