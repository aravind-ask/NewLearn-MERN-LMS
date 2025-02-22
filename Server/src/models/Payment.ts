// src/models/paymentModel.ts
import mongoose, { Document } from "mongoose";

export interface IPayment extends Document {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
}

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  paymentId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPayment>("Payment", paymentSchema);
