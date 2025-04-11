// interview.model.ts
import { Schema, model, Document } from "mongoose";
import { Interview } from "../types/types";

export interface IInterview extends Document {
  id: string;
  position: string;
  description: string;
  experience: number;
  userId: string;
  techStack: string;
  questions: { question: string; answer: string }[];
  videoUrl?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const interviewSchema = new Schema<IInterview>(
  {
    position: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true },
    experience: { type: Number, required: true, min: 0 },
    userId: { type: String, required: true },
    techStack: { type: String, required: true },
    questions: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    videoUrl: { type: String },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

export const InterviewModel = model<IInterview>("Interview", interviewSchema);
