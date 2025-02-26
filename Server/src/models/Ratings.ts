import mongoose, { Document, Schema } from "mongoose";

export interface IRating extends Document {
  userId: string; // ID of the user who submitted the review
  courseId: string; // ID of the course being reviewed
  userName: string; // Name of the user who submitted the review
  rating: number; // Rating value (1-5)
  comment: string; // Review comment
  createdAt: Date; // Timestamp of when the review was created
  updatedAt: Date; // Timestamp of when the review was last updated
}

const RatingSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRating>("Rating", RatingSchema);
