import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  userId: string;
  type: "new_course" | "message" | "assignment" | "other";
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: ["new_course", "message", "assignment", "other"],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
