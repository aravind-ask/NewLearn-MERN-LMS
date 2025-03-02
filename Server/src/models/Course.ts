// src/models/Course.ts
import mongoose, { Schema, Document } from "mongoose";

export interface Lecture {
  title: string;
  videoUrl: string;
  public_id: string;
  freePreview: boolean;
}

const LectureSchema = new Schema<Lecture>({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  public_id: { type: String, required: true },
  freePreview: { type: Boolean, required: true },
});

export interface Section {
  title: string;
  lectures: Lecture[];
}

const SectionSchema = new Schema<Section>({
  title: { type: String, required: true },
  lectures: [LectureSchema],
});

export interface ICourse extends Document {
  instructorId: string;
  instructorName: string;
  date: Date;
  title: string;
  category: mongoose.Types.ObjectId;
  level: string;
  primaryLanguage: string;
  subtitle: string;
  description?: string;
  image: string;
  pricing: number;
  objectives: string;
  welcomeMessage: string;
  students: [
    {
      studentId: string;
      studentName: string;
      studentEmail: string;
      paidAmount: number;
      dateJoined: Date;
    }
  ];
  curriculum: Section[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    instructorId: { type: String, required: true },
    instructorName: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    title: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    level: { type: String, required: true },
    primaryLanguage: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    pricing: { type: Number, required: true },
    objectives: { type: String, required: true },
    welcomeMessage: { type: String, required: true },
    students: [
      {
        studentId: { type: String, required: true },
        studentName: { type: String, required: true },
        studentEmail: { type: String, required: true },
        paidAmount: { type: Number, required: true },
        dateJoined: { type: Date, default: Date.now },
      },
    ],
    curriculum: [SectionSchema],
  },
  { timestamps: true }
);

export const Course = mongoose.model<ICourse>("Course", CourseSchema);
