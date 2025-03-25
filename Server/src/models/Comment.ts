// models/comment.model.ts
import mongoose, { Schema } from "mongoose";

export interface IComment extends Document {
  discussionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  mediaUrl?: string;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema({
  discussionId: {
    type: Schema.Types.ObjectId,
    ref: "Discussion",
    required: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  mediaUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
