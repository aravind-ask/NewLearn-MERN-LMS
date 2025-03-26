import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  userId: string; // Recipient of the notification
  type: "new_course" | "message" | "assignment" | "other"; // Notification type
  title: string; // Short title (e.g., "New Course Available")
  message: string; // Detailed message
  relatedId?: string; // Optional ID of related entity (e.g., courseId, messageId)
  isRead: boolean; // Whether the user has read it
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
