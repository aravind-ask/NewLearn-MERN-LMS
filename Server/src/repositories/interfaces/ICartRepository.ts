// src/repositories/cart.repository.interface.ts
import { ICourse } from "../../models/Course";
import { ICart, ICartItem, IPopulatedCart } from "../../models/Cart";
import { IOffer } from "../../models/Offers";

export interface ICartRepository {
  findByUserId(userId: string): Promise<IPopulatedCart | null>;
  addItem(userId: string, item: ICartItem): Promise<ICart>;
  removeItem(userId: string, courseId: string): Promise<ICart>;
  create(userId: string): Promise<ICart>;
}

export interface IPopulatedCartItem {
  course: ICourse;
  offer: IOffer | null;
}

