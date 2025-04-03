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
exports.CourseController = void 0;
const course_dto_1 = require("../utils/course.dto");
const responseHandler_1 = require("../utils/responseHandler");
const tokenUtils_1 = require("../utils/tokenUtils");
const statusCodes_1 = require("../utils/statusCodes");
class CourseController {
    constructor(courseService, enrollmentService) {
        this.courseService = courseService;
        this.enrollmentService = enrollmentService;
    }
    createCourse(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courseData = course_dto_1.CreateCourseDto.parse(req.body);
                if (!req.user)
                    throw new Error("Unauthorized");
                courseData.instructorId = req.user.id;
                const newCourse = yield this.courseService.createCourse(courseData);
                (0, responseHandler_1.successResponse)(res, newCourse, "Course created successfully", statusCodes_1.HttpStatus.CREATED);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error, error.status || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
    editCourse(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = course_dto_1.EditCourseDto.parse(req.body);
                const updatedCourse = yield this.courseService.editCourse(validatedData);
                if (!updatedCourse) {
                    (0, responseHandler_1.errorResponse)(res, { message: "Course not found" }, statusCodes_1.HttpStatus.NOT_FOUND);
                    return;
                }
                (0, responseHandler_1.successResponse)(res, updatedCourse, "Course updated successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error, error.status || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
    deleteCourse(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId } = req.params;
                const deletedCourse = yield this.courseService.deleteCourse(courseId);
                if (!deletedCourse) {
                    (0, responseHandler_1.errorResponse)(res, { message: "Course not found" }, statusCodes_1.HttpStatus.NOT_FOUND);
                    return;
                }
                (0, responseHandler_1.successResponse)(res, {}, "Course deleted successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error, error.status || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
    getAllCourses(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { page = "1", limit = "10", search, category, difficulty, sortBy, sortOrder, } = req.query;
                let excludeInstructorId;
                const authHeader = req.headers.authorization;
                if (authHeader && authHeader.startsWith("Bearer ")) {
                    const token = authHeader.split(" ")[1];
                    try {
                        const decoded = tokenUtils_1.tokenUtils.verifyAccessToken(token);
                        req.user = { id: decoded.userId, role: decoded.role };
                        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === "instructor") {
                            excludeInstructorId = req.user.id;
                        }
                    }
                    catch (error) {
                        (0, responseHandler_1.errorResponse)(res, "Invalid or expired access token", statusCodes_1.HttpStatus.UNAUTHORIZED);
                        return;
                    }
                }
                const result = yield this.courseService.getAllCourses(Number(page), Number(limit), search, category, difficulty, sortBy, sortOrder, excludeInstructorId);
                (0, responseHandler_1.successResponse)(res, result, "Courses fetched successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error, error.status || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
    getInstructorCourses(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    (0, responseHandler_1.errorResponse)(res, "Unauthorized", statusCodes_1.HttpStatus.UNAUTHORIZED);
                    return;
                }
                const instructorId = req.user.id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { sortBy = "createdAt", order = "desc", search = "" } = req.query;
                const filter = {
                    instructorId,
                    title: { $regex: search, $options: "i" },
                };
                const sortKey = typeof sortBy === "string" ? sortBy : "createdAt";
                const sortOptions = {};
                sortOptions[sortKey] = order === "desc" ? -1 : 1;
                const result = yield this.courseService.fetchInstructorCourses(filter, page, limit, sortOptions);
                (0, responseHandler_1.successResponse)(res, result, "Courses fetched successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error, error.status || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
    getCourseDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId } = req.params;
                if (!courseId) {
                    (0, responseHandler_1.errorResponse)(res, "Course not found", statusCodes_1.HttpStatus.NOT_FOUND);
                    return;
                }
                const authHeader = req.headers.authorization;
                let isCourseEnrolled = null;
                if (authHeader && authHeader.startsWith("Bearer ")) {
                    const token = authHeader.split(" ")[1];
                    try {
                        const decoded = tokenUtils_1.tokenUtils.verifyAccessToken(token);
                        req.user = { id: decoded.userId, role: decoded.role };
                        const isEnrolled = yield this.enrollmentService.checkEnrolled(req.user.id, courseId);
                        if (isEnrolled) {
                            isCourseEnrolled = { courseId };
                        }
                    }
                    catch (error) {
                        (0, responseHandler_1.errorResponse)(res, "Invalid or expired access token", statusCodes_1.HttpStatus.UNAUTHORIZED);
                        return;
                    }
                }
                const courseDetails = yield this.courseService.getCourseDetails(courseId);
                if (!courseDetails) {
                    (0, responseHandler_1.errorResponse)(res, "Course not found", statusCodes_1.HttpStatus.NOT_FOUND);
                    return;
                }
                const course = { courseDetails, isEnrolled: isCourseEnrolled };
                (0, responseHandler_1.successResponse)(res, course, "Course details fetched successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
    checkCourseEnrollmentInfo(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    (0, responseHandler_1.errorResponse)(res, "Unauthorized", statusCodes_1.HttpStatus.UNAUTHORIZED);
                    return;
                }
                const { courseId } = req.params;
                const isEnrolled = yield this.enrollmentService.checkEnrolled(req.user.id, courseId);
                (0, responseHandler_1.successResponse)(res, { isEnrolled }, "Enrollment info fetched successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
}
exports.CourseController = CourseController;
