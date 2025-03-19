import mongoose, { Schema } from "mongoose";

// models/comment.model.ts (unchanged)
export interface IComment extends Document {
  discussionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
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
  createdAt: { type: Date, default: Date.now },
});

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
