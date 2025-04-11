"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseProgressRepository = void 0;
// src/repositories/CourseProgressRepository.ts
const base_repository_1 = require("./base.repository"); // Adjust path
const CourseProgress_1 = __importDefault(require("../models/CourseProgress"));
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const Course_1 = require("../models/Course");
class CourseProgressRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(CourseProgress_1.default);
    }
    findCourseProgress(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.findOne({ userId, courseId });
            }
            catch (error) {
                console.error("Error finding course progress:", error);
                throw new Error("Failed to find course progress");
            }
        });
    }
    createCourseProgress(courseProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.create(courseProgress);
            }
            catch (error) {
                console.error("Error creating course progress:", error);
                throw new Error("Failed to create course progress");
            }
        });
    }
    updateLectureProgress(userId, courseId, lectureId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const course = yield Course_1.Course.findById(courseId);
                if (!course) {
                    throw new Error("Course not found");
                }
                const totalLectures = course.curriculum.reduce((total, section) => {
                    return total + section.lectures.length;
                }, 0);
                const progress = yield this.findCourseProgress(userId, courseId);
                if (!progress) {
                    const newProgress = yield this.create({
                        userId,
                        courseId,
                        lecturesProgress: [
                            { lectureId, viewed: true, dateViewed: new Date() },
                        ],
                        totalLectures,
                        viewedLectures: 1,
                    });
                    yield Enrollment_1.default.findOneAndUpdate({ userId, "courses.courseId": courseId }, { $set: { "courses.$.courseProgressId": newProgress._id } });
                    return newProgress;
                }
                const lectureProgress = progress.lecturesProgress.find((item) => item.lectureId === lectureId);
                if (lectureProgress) {
                    lectureProgress.viewed = true;
                    lectureProgress.dateViewed = new Date();
                }
                else {
                    progress.lecturesProgress.push({
                        lectureId,
                        viewed: true,
                        dateViewed: new Date(),
                    });
                    progress.viewedLectures = progress.viewedLectures + 1;
                }
                return yield progress.save();
            }
            catch (error) {
                console.error("Error updating lecture progress:", error);
                throw new Error("Failed to update lecture progress");
            }
        });
    }
    markCourseAsCompleted(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.update(userId, {
                    courseId,
                    completed: true,
                    completionDate: new Date(),
                });
            }
            catch (error) {
                console.error("Error marking course as completed:", error);
                throw new Error("Failed to mark course as completed");
            }
        });
    }
    resetCourseProgress(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.update(userId, {
                    courseId,
                    lecturesProgress: [],
                    completed: false,
                    // completionDate: null,
                    viewedLectures: 0,
                });
            }
            catch (error) {
                console.error("Error resetting course progress:", error);
                throw new Error("Failed to reset course progress");
            }
        });
    }
}
exports.CourseProgressRepository = CourseProgressRepository;
