// src/types/course.types.ts
import { IPopulatedCartItem } from "@/repositories/interfaces/ICartRepository";
import { Document, Schema, model, Types } from "mongoose";

export interface IOffer {
  _id: string;
  title: string;
  description: string;
  discountPercentage: number;
}

export interface ICartItem {
  course: Types.ObjectId;
  offer: IOffer | null;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPopulatedCart extends Document {
  userId: Types.ObjectId;
  items: IPopulatedCartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  items: [
    {
      course: { type: Schema.Types.ObjectId, required: true, ref: "Course" },
      offer: {
        type: {
          _id: { type: String, required: true },
          title: { type: String, required: true },
          description: { type: String, required: true },
          discountPercentage: { type: Number, required: true },
        },
        required: false,
        default: null,
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const CartModel = model<ICart>("Cart", cartSchema);
