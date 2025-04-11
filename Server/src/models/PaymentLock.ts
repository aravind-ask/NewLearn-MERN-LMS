// src/models/PaymentLock.ts
import { Schema, model, Document } from "mongoose";

export interface IPaymentLock extends Document {
  userId: string;
  courseId: string;
  expiresAt: Date;
}

const paymentLockSchema = new Schema<IPaymentLock>({
  userId: { type: String, required: true },
  courseId: { type: String, required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
});

paymentLockSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const PaymentLock = model<IPaymentLock>(
  "PaymentLock",
  paymentLockSchema
);
