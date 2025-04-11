// src/models/Wishlist.ts
import { Schema, model, Document } from "mongoose";
import mongoose from "mongoose";

export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId; 
  courseId: mongoose.Types.ObjectId; 
  addedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true }, 
  addedAt: { type: Date, default: Date.now },
});

export const Wishlist = model<IWishlist>("Wishlist", wishlistSchema);
