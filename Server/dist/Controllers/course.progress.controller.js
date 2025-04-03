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
exports.CourseProgressController = void 0;
const responseHandler_1 = require("../utils/responseHandler");
class CourseProgressController {
    constructor(courseProgressService) {
        this.courseProgressService = courseProgressService;
    }
    markCurrentLectureAsViewed(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { courseId, lectureId } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const progress = yield this.courseProgressService.markCurrentLectureAsViewed(userId, courseId, lectureId);
                (0, responseHandler_1.successResponse)(res, progress, "Lecture marked as viewed", 200);
            }
            catch (error) {
                console.error(error);
                (0, responseHandler_1.errorResponse)(res, error.message || "Internal Server Error", error.status || 500);
            }
        });
    }
    getCurrentCourseProgress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { courseId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const result = yield this.courseProgressService.getCurrentCourseProgress(userId, courseId);
                (0, responseHandler_1.successResponse)(res, result, "Course progress retrieved", 200);
            }
            catch (error) {
                console.error(error);
                (0, responseHandler_1.errorResponse)(res, error.message || "Internal Server Error", error.status || 500);
            }
        });
    }
    resetCurrentCourseProgress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { courseId } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const progress = yield this.courseProgressService.resetCurrentCourseProgress(userId, courseId);
                (0, responseHandler_1.successResponse)(res, progress, "Course progress has been reset", 200);
            }
            catch (error) {
                console.error(error);
                (0, responseHandler_1.errorResponse)(res, error.message || "Some error occurred!", error.status || 500);
            }
        });
    }
}
exports.CourseProgressController = CourseProgressController;
