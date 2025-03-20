// src/models/Certificate.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ICertificate extends Document {
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  completionDate: Date;
  certificateId: string;
  verificationUrl: string; 
  createdAt: Date;
}

const CertificateSchema: Schema = new Schema({
  userId: { type: String, required: true, ref: "User" },
  userName: { type: String, required: true },
  courseId: { type: String, required: true, ref: "Course" },
  courseTitle: { type: String, required: true },
  completionDate: { type: Date, required: true },
  certificateId: { type: String, required: true, unique: true },
  verificationUrl: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICertificate>("Certificate", CertificateSchema);
