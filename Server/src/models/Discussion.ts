import mongoose, { Schema, Document } from "mongoose";

export interface IDiscussion extends Document {
  lectureId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  topic: string;
  mediaUrl?: string;
  createdAt: Date;
}

const DiscussionSchema: Schema = new Schema({
  lectureId: { type: Schema.Types.ObjectId, ref: "Lecture", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: String, required: true },
  mediaUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

export const Discussion = mongoose.model<IDiscussion>(
  "Discussion",
  DiscussionSchema
);

