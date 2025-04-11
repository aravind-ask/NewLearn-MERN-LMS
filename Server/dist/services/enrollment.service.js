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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentService = void 0;
class EnrollmentService {
    constructor(enrollmentRepo) {
        this.enrollmentRepo = enrollmentRepo;
    }
    fetchEnrolledCourses(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const enrollment = yield this.enrollmentRepo.getEnrolledCourses(userId);
                if (!enrollment || !enrollment.courses.length) {
                    return { courses: [], totalPages: 0 };
                }
                const startIndex = (page - 1) * limit;
                const endIndex = page * limit;
                const paginatedCourses = enrollment.courses.slice(startIndex, endIndex);
                const totalPages = Math.ceil(enrollment.courses.length / limit);
                return { courses: paginatedCourses, totalPages };
            }
            catch (error) {
                console.error("Error fetching enrolled courses:", error);
                throw new Error("Failed to fetch enrolled courses");
            }
        });
    }
    checkEnrolled(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Checking enrollment");
                return yield this.enrollmentRepo.isCourseEnrolled(userId, courseId);
            }
            catch (error) {
                console.error("Error checking enrollment:", error);
                throw new Error("Failed to check enrollment");
            }
        });
    }
}
exports.EnrollmentService = EnrollmentService;
exports.default = EnrollmentService;
