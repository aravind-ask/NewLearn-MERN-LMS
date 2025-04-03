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
exports.EnrollmentRepository = void 0;
// src/repositories/enrollment.repository.ts
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
class EnrollmentRepository {
    enrollUserInCourses(userId, courses) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const enrollment = yield Enrollment_1.default.findOneAndUpdate({ userId }, { $addToSet: { courses: { $each: courses } } }, { upsert: true, new: true }).exec();
                return enrollment;
            }
            catch (error) {
                throw new Error("Error enrolling user in courses");
            }
        });
    }
    isCourseEnrolled(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exists = yield Enrollment_1.default.exists({
                    userId,
                    "courses.courseId": courseId,
                });
                return !!exists;
            }
            catch (error) {
                throw new Error("Error checking course enrollment");
            }
        });
    }
    getEnrolledCourses(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield Enrollment_1.default.findOne({ userId })
                    .populate("courses.courseProgressId")
                    .populate("courses.courseId")
                    .exec();
            }
            catch (error) {
                throw new Error("Error fetching enrolled courses");
            }
        });
    }
}
exports.EnrollmentRepository = EnrollmentRepository;
