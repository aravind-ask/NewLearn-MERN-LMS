import mongoose, { Schema, Document } from "mongoose";

export interface IStudentCourse extends Document {
  userId: string;
  courses: {
    courseId: string;
    title: string;
    instructorId: string;
    instructorName: string;
    dateOfPurchase: Date;
    courseImage: string;
  }[];
}

const StudentCourseSchema = new Schema<IStudentCourse>(
  {
    userId: String,
    courses: [
      {
        courseId: String,
        title: String,
        instructorId: String,
        instructorName: String,
        dateOfPurchase: Date,
        courseImage: String,
      },
    ],
  },
  { timestamps: true }
);

export const StudentCourse = mongoose.model<IStudentCourse>(
  "StudentCourses",
  StudentCourseSchema
);
