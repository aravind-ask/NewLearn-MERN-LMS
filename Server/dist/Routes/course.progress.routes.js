"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const course_progress_controller_1 = require("../Controllers/course.progress.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const course_progress_service_1 = require("../services/course.progress.service");
const router = express_1.default.Router();
const courseProgressController = new course_progress_controller_1.CourseProgressController(new course_progress_service_1.CourseProgressService());
router.post("/mark-lecture-viewed", auth_middleware_1.authMiddleware.verifyAccessToken, courseProgressController.markCurrentLectureAsViewed.bind(courseProgressController));
router.get("/:courseId", auth_middleware_1.authMiddleware.verifyAccessToken, courseProgressController.getCurrentCourseProgress.bind(courseProgressController));
router.post("/reset-progress", auth_middleware_1.authMiddleware.verifyAccessToken, courseProgressController.resetCurrentCourseProgress.bind(courseProgressController));
exports.default = router;
