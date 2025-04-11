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
exports.CourseRepository = void 0;
// src/repositories/CourseRepository.ts
const Course_1 = require("../models/Course");
const base_repository_1 = require("./base.repository");
const mongoose_1 = __importDefault(require("mongoose"));
class CourseRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Course_1.Course);
    }
    createCourse(courseCreationData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courseData = Object.assign(Object.assign({}, courseCreationData), { category: new mongoose_1.default.Types.ObjectId(courseCreationData.category) });
                return yield this.create(courseData);
            }
            catch (error) {
                console.error("Error creating course:", error);
                throw new Error("Failed to create course");
            }
        });
    }
    findCourseById(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findById(courseId, "category");
        });
    }
    updateCourse(courseId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("data", data);
                return yield this.model
                    .findByIdAndUpdate(courseId, data, { new: true })
                    .populate("category")
                    .exec();
            }
            catch (error) {
                console.error("Error updating course:", error);
                throw new Error("Failed to update course");
            }
        });
    }
    updateCourseEnrollment(courseId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.model
                    .findByIdAndUpdate(courseId, {
                    $addToSet: {
                        students: Object.assign(Object.assign({}, data), { dateJoined: new Date() }),
                    },
                }, { new: true })
                    .populate("category")
                    .exec();
            }
            catch (error) {
                console.error("Error updating course enrollment:", error);
                throw new Error("Failed to update course enrollment");
            }
        });
    }
    getAllCourses(page_1, limit_1, search_1, category_1, difficulty_1, sortBy_1) {
        return __awaiter(this, arguments, void 0, function* (page, limit, search, category, difficulty, sortBy, sortOrder = "desc", excludeInstructorId) {
            try {
                const query = {};
                if (search)
                    query.title = { $regex: search, $options: "i" };
                if (category)
                    query.category = category;
                if (difficulty)
                    query.level = difficulty;
                if (excludeInstructorId)
                    query.instructorId = { $ne: excludeInstructorId };
                const sortField = sortBy === "price" ? "pricing" : "createdAt";
                const sortDirection = sortOrder === "asc" ? 1 : -1;
                const result = yield this.findAll(page, limit, query, {
                    [sortField]: sortDirection,
                });
                const courses = yield this.model.populate(result.items, {
                    path: "category",
                });
                return {
                    courses,
                    totalCourses: result.totalItems,
                    totalPages: result.totalPages,
                };
            }
            catch (error) {
                console.error("Error getting all courses:", error);
                throw new Error("Failed to get all courses");
            }
        });
    }
    getCourseDetails(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findById(courseId, "category");
        });
    }
    getInstructorCourses(filter, page, limit, sortOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.findAll(page, limit, filter, sortOptions);
                const courses = yield this.model.populate(result.items, {
                    path: "category",
                });
                return { courses, totalCourses: result.totalItems };
            }
            catch (error) {
                console.error("Error getting instructor courses:", error);
                throw new Error("Failed to get instructor courses");
            }
        });
    }
    deleteCourse(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.delete(courseId);
        });
    }
}
exports.CourseRepository = CourseRepository;
