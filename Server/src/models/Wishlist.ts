import { Schema, model, Document } from "mongoose";

export interface IWishlist extends Document {
  userId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
  addedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  addedAt: { type: Date, default: Date.now },
});

export const Wishlist = model<IWishlist>("Wishlist", wishlistSchema);
