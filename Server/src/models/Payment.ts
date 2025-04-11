// src/models/paymentModel.ts
import mongoose, { Document } from "mongoose";

export interface IPayment extends Document {
  userId: string;
  userName: string;
  userEmail: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: Date;
  orderId: string;
  paymentId: string;
  payerId: string;
  courses: {
    courseId: string;
    courseTitle: string;
    courseImage: string;
    coursePrice: number;
    instructorId: string;
    instructorName: string;
  }[];
  amount: number;
}

const paymentSchema = new mongoose.Schema<IPayment>(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    orderStatus: { type: String, default: "pending" },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, default: "pending" },
    orderDate: { type: Date, default: Date.now },
    orderId: { type: String, required: true },
    paymentId: { type: String, required: true },
    payerId: { type: String },
    courses: [
      {
        courseId: { type: String, required: true },
        courseTitle: { type: String, required: true },
        courseImage: { type: String, required: true },
        coursePrice: { type: Number, required: true },
        instructorId: { type: String, required: true },
        instructorName: { type: String, required: true },
      },
    ],
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("Payment", paymentSchema);
