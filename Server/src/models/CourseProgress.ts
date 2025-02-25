import mongoose, { Document } from "mongoose";

export interface LectureProgress {
  lectureId: string;
  viewed: boolean;
  dateViewed: Date;
}

export interface ICourseProgress extends Document {
  userId: string;
  courseId: string;
  completed: boolean;
  completionDate: Date;
  lecturesProgress: LectureProgress[];
}

const LectureProgressSchema = new mongoose.Schema<LectureProgress>({
  lectureId: { type: String, required: true },
  viewed: { type: Boolean, required: true },
  dateViewed: { type: Date, required: false },
});

const courseProgress = new mongoose.Schema<ICourseProgress>(
  {
    userId: { type: String },
    courseId: { type: String },
    completed: { type: Boolean },
    completionDate: { type: Date },
    lecturesProgress: [LectureProgressSchema],
  },
  { timestamps: true }
);

export default mongoose.model<ICourseProgress>(
  "CourseProgress",
  courseProgress
);
