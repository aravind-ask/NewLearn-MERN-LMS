import mongoose, { Schema, Document } from "mongoose";
import { ICategory } from "./Category";

export interface IOffer extends Document {
  title: string;
  description?: string;
  discountPercentage: number;
  category?: mongoose.Types.ObjectId | ICategory;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true },
    description: { type: String },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Offer = mongoose.model<IOffer>("Offer", OfferSchema);
