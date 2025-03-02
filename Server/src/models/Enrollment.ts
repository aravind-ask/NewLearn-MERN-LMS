// src/models/Enrollment.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IEnrollment extends Document {
  userId: string;
  courses: {
    courseId: string;
    courseTitle: string;
    courseImage: string;
    coursePrice: number;
    instructorId: string;
    instructorName: string;
    dateOfPurchase: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    userId: { type: String, required: true, index: true },
    courses: [
      {
        courseId: { type: String, required: true },
        courseTitle: { type: String, required: true },
        courseImage: { type: String, required: true },
        coursePrice: { type: Number, required: true },
        instructorId: { type: String, required: true },
        instructorName: { type: String, required: true },
        dateOfPurchase: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);
