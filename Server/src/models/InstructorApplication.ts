import mongoose, { Schema, Document } from "mongoose";

export interface IInstructorApplication extends Document {
  user: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  experience: number;
  skills: string[];
  bio: string;
  certificates: string[];
  linkedinProfile?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

const InstructorApplicationSchema = new Schema<IInstructorApplication>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: Number, required: true },
    skills: [{ type: String, required: true }],
    bio: { type: String, required: true },
    certificates: [{ type: String, required: true }],
    linkedinProfile: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export const InstructorApplication = mongoose.model<IInstructorApplication>(
  "InstructorApplication",
  InstructorApplicationSchema
);
