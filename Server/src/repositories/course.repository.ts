import { Course } from "../models/Course";
import { ICourse } from "../models/Course";
import { CreateCourseInput } from "../utils/course.dto";
import { ICourseRepository } from "./interfaces/ICourseRepository";
import mongoose from "mongoose";

interface InstructorCoursesResult {
  courses: ICourse[];
  totalCourses: number;
  totalPages?: number;
}

export class CourseRepository implements ICourseRepository {
  async createCourse(courseCreationData: CreateCourseInput): Promise<ICourse> {
    try {
      const courseData = {
        ...courseCreationData,
        category: new mongoose.Types.ObjectId(courseCreationData.category),
      };
      return await Course.create(courseData);
    } catch (error) {
      console.error("Error creating course:", error);
      throw new Error("Failed to create course");
    }
  }

  async findCourseById(courseId: string): Promise<ICourse | null> {
    try {
      return await Course.findById(courseId).populate("category").exec();
    } catch (error) {
      console.error("Error finding course by ID:", error);
      throw new Error("Failed to find course by ID");
    }
  }

  async updateCourse(
    courseId: string,
    data: Partial<ICourse>
  ): Promise<ICourse | null> {
    try {
      console.log("data", data);
      return await Course.findByIdAndUpdate(courseId, data, { new: true })
        .populate("category")
        .exec();
    } catch (error) {
      console.error("Error updating course:", error);
      throw new Error("Failed to update course");
    }
  }

  async updateCourseEnrollment(
    courseId: string,
    data: {
      studentId: string;
      studentName: string;
      studentEmail: string;
      paidAmount: number;
    }
  ): Promise<ICourse | null> {
    try {
      return await Course.findByIdAndUpdate(
        courseId,
        {
          $addToSet: {
            students: { ...data, dateJoined: new Date() },
          },
        },
        { new: true }
      )
        .populate("category")
        .exec();
    } catch (error) {
      console.error("Error updating course enrollment:", error);
      throw new Error("Failed to update course enrollment");
    }
  }

  async getAllCourses(
    page: number,
    limit: number,
    search?: string,
    category?: string,
    difficulty?: string,
    sortBy?: string,
    sortOrder: "asc" | "desc" = "desc",
    excludeInstructorId?: string
  ): Promise<{
    courses: ICourse[];
    totalCourses: number;
    totalPages?: number;
  }> {
    try {
      const query: any = {};
      if (search) query.title = { $regex: search, $options: "i" };
      if (category) query.category = category;
      if (difficulty) query.level = difficulty;
      if (excludeInstructorId)
        query.instructorId = { $ne: excludeInstructorId };

      const sortField = sortBy === "price" ? "pricing" : "createdAt";
      const sortDirection = sortOrder === "asc" ? 1 : -1;

      const courses = await Course.find(query)
        .populate("category")
        .sort({ [sortField]: sortDirection })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      const totalCourses = await Course.countDocuments(query);
      const totalPages = Math.ceil(totalCourses / limit);

      return { courses, totalCourses, totalPages };
    } catch (error) {
      console.error("Error getting all courses:", error);
      throw new Error("Failed to get all courses");
    }
  }

  async getCourseDetails(courseId: string): Promise<ICourse | null> {
    try {
      return await Course.findById(courseId).populate("category").exec();
    } catch (error) {
      console.error("Error getting course details:", error);
      throw new Error("Failed to get course details");
    }
  }

  async getInstructorCourses(
    filter: { instructorId: string; title: { $regex: any; $options: string } },
    page: number,
    limit: number,
    sortOptions: { [key: string]: 1 | -1 }
  ): Promise<{ courses: ICourse[]; totalCourses: number }> {
    try {
      const skip = (page - 1) * limit;
      const courses = await Course.find(filter)
        .populate("category")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec();

      const totalCourses = await Course.countDocuments(filter);
      return { courses, totalCourses };
    } catch (error) {
      console.error("Error getting instructor courses:", error);
      throw new Error("Failed to get instructor courses");
    }
  }

  async deleteCourse(courseId: string): Promise<ICourse | null> {
    try {
      return await Course.findByIdAndDelete(courseId).exec();
    } catch (error) {
      console.error("Error deleting course:", error);
      throw new Error("Failed to delete course");
    }
  }
}
