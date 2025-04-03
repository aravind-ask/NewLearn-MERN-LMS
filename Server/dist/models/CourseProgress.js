"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const LectureProgressSchema = new mongoose_1.default.Schema({
    lectureId: { type: String, required: true },
    viewed: { type: Boolean, required: true },
    dateViewed: { type: Date, required: false },
});
const courseProgress = new mongoose_1.default.Schema({
    userId: { type: String },
    courseId: { type: String },
    completed: { type: Boolean },
    completionDate: { type: Date },
    lecturesProgress: [LectureProgressSchema],
    totalLectures: { type: Number },
    viewedLectures: { type: Number },
}, { timestamps: true });
exports.default = mongoose_1.default.model("CourseProgress", courseProgress);
