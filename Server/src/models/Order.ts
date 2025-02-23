import mongoose, { Document } from "mongoose";

export interface IOrders extends Document {
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
  instructorId: string;
  instructorName: string;
  courses: [
    {
      courseId: string;
      courseTitle: string;
      courseImage: string;
      coursePrice: number;
    }
  ];
}

const orderSchema = new mongoose.Schema<IOrders>(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    orderStatus: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    orderDate: { type: Date, required: true },
    orderId: { type: String, required: true },
    paymentId: { type: String, required: true },
    payerId: { type: String, required: true },
    instructorId: { type: String, required: true },
    instructorName: { type: String, required: true },
    courses: [
      {
        courseId: { type: String, required: true },
        courseTitle: { type: String, required: true },
        courseImage: { type: String, required: true },
        coursePrice: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrders>("Orders", orderSchema);
