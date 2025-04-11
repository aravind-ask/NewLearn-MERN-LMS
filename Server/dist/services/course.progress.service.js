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
exports.CourseProgressService = void 0;
// src/services/CourseProgressService.ts
const course_progress_repository_1 = require("../repositories/course.progress.repository");
const course_repository_1 = require("../repositories/course.repository");
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
class CourseProgressService {
    constructor() {
        this.courseProgressRepository = new course_progress_repository_1.CourseProgressRepository();
        this.courseRepo = new course_repository_1.CourseRepository();
    }
    markCurrentLectureAsViewed(userId, courseId, lectureId) {
        return __awaiter(this, void 0, void 0, function* () {
            const progress = yield this.courseProgressRepository.updateLectureProgress(userId, courseId, lectureId);
            const course = yield this.courseRepo.getCourseDetails(courseId);
            if (!course) {
                throw new Error("Course not found");
            }
            const allLecturesViewed = progress.lecturesProgress.length === course.curriculum.length &&
                progress.lecturesProgress.every((item) => item.viewed);
            if (allLecturesViewed) {
                yield this.courseProgressRepository.markCourseAsCompleted(userId, courseId);
            }
            return progress;
        });
    }
    getCurrentCourseProgress(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const studentPurchasedCourses = yield Enrollment_1.default.findOne({ userId });
            const isCoursePurchased = studentPurchasedCourses === null || studentPurchasedCourses === void 0 ? void 0 : studentPurchasedCourses.courses.some((item) => item.courseId === courseId);
            if (!isCoursePurchased) {
                return {
                    isPurchased: false,
                    message: "You need to purchase this course to access it.",
                };
            }
            const progress = yield this.courseProgressRepository.findCourseProgress(userId, courseId);
            if (!progress || progress.lecturesProgress.length === 0) {
                const course = yield this.courseRepo.getCourseDetails(courseId);
                if (!course) {
                    throw new Error("Course not found");
                }
                return {
                    courseDetails: course,
                    progress: [],
                    isPurchased: true,
                    message: "No progress found, you can start watching the course.",
                };
            }
            const courseDetails = yield this.courseRepo.getCourseDetails(courseId);
            return {
                courseDetails,
                progress: progress.lecturesProgress,
                completed: progress.completed,
                completionDate: progress.completionDate,
                isPurchased: true,
            };
        });
    }
    resetCurrentCourseProgress(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.courseProgressRepository.resetCourseProgress(userId, courseId);
        });
    }
}
exports.CourseProgressService = CourseProgressService;
