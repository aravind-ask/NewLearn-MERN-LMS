import { Schema, model, Document } from "mongoose";

export interface IUserAnswer extends Document {
  id: string;
  mockIdRef: string;
  question: string;
  correct_ans: string;
  user_ans: string;
  feedback: string;
  rating: number;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const userAnswerSchema = new Schema<IUserAnswer>(
  {
    mockIdRef: { type: String, required: true },
    question: { type: String, required: true },
    correct_ans: { type: String, required: true },
    user_ans: { type: String, required: true },
    feedback: { type: String, required: true },
    rating: { type: Number, required: true },
    userId: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

export const UserAnswerModel = model<IUserAnswer>(
  "UserAnswer",
  userAnswerSchema
);
