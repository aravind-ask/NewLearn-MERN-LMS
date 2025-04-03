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
const Course_1 = require("../models/Course");
const mongoose_1 = __importDefault(require("mongoose"));
class CourseRepository {
    createCourse(courseCreationData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courseData = Object.assign(Object.assign({}, courseCreationData), { category: new mongoose_1.default.Types.ObjectId(courseCreationData.category) });
                return yield Course_1.Course.create(courseData);
            }
            catch (error) {
                console.error("Error creating course:", error);
                throw new Error("Failed to create course");
            }
        });
    }
    findCourseById(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield Course_1.Course.findById(courseId).populate("category").exec();
            }
            catch (error) {
                console.error("Error finding course by ID:", error);
                throw new Error("Failed to find course by ID");
            }
        });
    }
    updateCourse(courseId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("data", data);
                return yield Course_1.Course.findByIdAndUpdate(courseId, data, { new: true })
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
                return yield Course_1.Course.findByIdAndUpdate(courseId, {
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
                const courses = yield Course_1.Course.find(query)
                    .populate("category")
                    .sort({ [sortField]: sortDirection })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .exec();
                const totalCourses = yield Course_1.Course.countDocuments(query);
                const totalPages = Math.ceil(totalCourses / limit);
                return { courses, totalCourses, totalPages };
            }
            catch (error) {
                console.error("Error getting all courses:", error);
                throw new Error("Failed to get all courses");
            }
        });
    }
    getCourseDetails(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield Course_1.Course.findById(courseId).populate("category").exec();
            }
            catch (error) {
                console.error("Error getting course details:", error);
                throw new Error("Failed to get course details");
            }
        });
    }
    getInstructorCourses(filter, page, limit, sortOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const courses = yield Course_1.Course.find(filter)
                    .populate("category")
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit)
                    .exec();
                const totalCourses = yield Course_1.Course.countDocuments(filter);
                return { courses, totalCourses };
            }
            catch (error) {
                console.error("Error getting instructor courses:", error);
                throw new Error("Failed to get instructor courses");
            }
        });
    }
    deleteCourse(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield Course_1.Course.findByIdAndDelete(courseId).exec();
            }
            catch (error) {
                console.error("Error deleting course:", error);
                throw new Error("Failed to delete course");
            }
        });
    }
}
exports.CourseRepository = CourseRepository;
