// src/models/enrollmentModel.ts
import mongoose, { Document } from "mongoose";

export interface IEnrollment extends Document {
  userId: string;
  courses: {
    courseId: string;
    courseTitle: string;
    instructorId: string;
    instructorName: string;
    dateOfPurchase: Date;
    courseImage: string;
  }[];
}

const enrollmentSchema = new mongoose.Schema<IEnrollment>(
  {
    userId: { type: String, required: true },
    courses: [
      {
        courseId: { type: String, required: true },
        courseTitle: { type: String, required: true },
        instructorId: { type: String, required: true },
        instructorName: { type: String, required: true },
        dateOfPurchase: { type: Date, default: Date.now },
        courseImage: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);
