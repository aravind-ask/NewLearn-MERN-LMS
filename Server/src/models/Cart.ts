import { Schema, model, Document } from "mongoose";

export interface ICart extends Document {
  userId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
  addedAt: Date;
}

const cartSchema = new Schema<ICart>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  addedAt: { type: Date, default: Date.now },
});

export const Cart = model<ICart>("Cart", cartSchema);
