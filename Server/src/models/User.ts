import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "student" | "instructor" | "admin";
  isVerified?: boolean;
  googleId?: string;
  otp: string;
  otpExpires: Date;
  enrolledCourses?: string[];
  photoUrl?: string;
  refreshToken?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    photoUrl: { type: String, default: "" },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
