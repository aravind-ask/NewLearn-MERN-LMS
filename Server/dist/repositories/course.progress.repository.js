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
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const CourseProgress_1 = __importDefault(require("../models/CourseProgress"));
const Course_1 = require("../models/Course");
class CourseProgressRepository {
    findCourseProgress(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return CourseProgress_1.default.findOne({ userId, courseId });
        });
    }
    createCourseProgress(courseProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            return CourseProgress_1.default.create(courseProgress);
        });
    }
    updateLectureProgress(userId, courseId, lectureId) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = yield Course_1.Course.findById(courseId);
            if (!course) {
                throw new Error("Course not found");
            }
            const totalLectures = course.curriculum.reduce((total, section) => {
                return total + section.lectures.length;
            }, 0);
            const progress = yield CourseProgress_1.default.findOne({ userId, courseId });
            if (!progress) {
                const newProgress = new CourseProgress_1.default({
                    userId,
                    courseId,
                    lecturesProgress: [
                        {
                            lectureId,
                            viewed: true,
                            dateViewed: new Date(),
                        },
                    ],
                    totalLectures,
                    viewedLectures: 1,
                });
                yield newProgress.save();
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
                    lectureId: lectureId,
                    viewed: true,
                    dateViewed: new Date(),
                });
                progress.viewedLectures = progress.viewedLectures + 1;
            }
            return progress.save();
        });
    }
    markCourseAsCompleted(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return CourseProgress_1.default.findOneAndUpdate({ userId, courseId }, { completed: true, completionDate: new Date() }, { new: true });
        });
    }
    resetCourseProgress(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return CourseProgress_1.default.findOneAndUpdate({ userId, courseId }, {
                lecturesProgress: [],
                completed: false,
                completionDate: null,
                viewedLectures: 0,
            }, { new: true });
        });
    }
}
exports.CourseProgressRepository = CourseProgressRepository;
