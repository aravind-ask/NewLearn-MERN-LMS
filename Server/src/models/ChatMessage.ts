import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  courseId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  message?: string;
  mediaUrl?: string;
  timestamp: Date;
  isRead: boolean;
  isDeleted: boolean;
  isEdited: boolean;
}

const chatMessageSchema = new Schema<IChatMessage>({
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: false },
  mediaUrl: { type: String, required: false },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
});

export const ChatMessage = mongoose.model<IChatMessage>(
  "ChatMessage",
  chatMessageSchema
);
