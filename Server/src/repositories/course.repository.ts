// src/repositories/CourseRepository.ts
import { Course, ICourse } from "../models/Course";
import { CreateCourseInput } from "../utils/course.dto";
import { ICourseRepository } from "./interfaces/ICourseRepository";
import { BaseRepository } from "./base.repository";
import mongoose from "mongoose";

export class CourseRepository
  extends BaseRepository<ICourse>
  implements ICourseRepository
{
  constructor() {
    super(Course);
  }

  async createCourse(courseCreationData: CreateCourseInput): Promise<ICourse> {
    try {
      const courseData = {
        ...courseCreationData,
        category: new mongoose.Types.ObjectId(courseCreationData.category),
      };
      return await this.create(courseData);
    } catch (error) {
      console.error("Error creating course:", error);
      throw new Error("Failed to create course");
    }
  }

  async findCourseById(courseId: string): Promise<ICourse | null> {
    return await this.findById(courseId, "category");
  }

  async updateCourse(
    courseId: string,
    data: Partial<ICourse>
  ): Promise<ICourse | null> {
    try {
      console.log("data", data);
      return await this.model
        .findByIdAndUpdate(courseId, data, { new: true })
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
      return await this.model
        .findByIdAndUpdate(
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

      const result = await this.findAll(page, limit, query, {
        [sortField]: sortDirection,
      });
      const courses = await this.model.populate(result.items, {
        path: "category",
      });

      return {
        courses,
        totalCourses: result.totalItems,
        totalPages: result.totalPages,
      };
    } catch (error) {
      console.error("Error getting all courses:", error);
      throw new Error("Failed to get all courses");
    }
  }

  async getCourseDetails(courseId: string): Promise<ICourse | null> {
    return await this.findById(courseId, "category");
  }

  async getInstructorCourses(
    filter: { instructorId: string; title: { $regex: any; $options: string } },
    page: number,
    limit: number,
    sortOptions: { [key: string]: 1 | -1 }
  ): Promise<{ courses: ICourse[]; totalCourses: number }> {
    try {
      const result = await this.findAll(page, limit, filter, sortOptions);
      const courses = await this.model.populate(result.items, {
        path: "category",
      });
      return { courses, totalCourses: result.totalItems };
    } catch (error) {
      console.error("Error getting instructor courses:", error);
      throw new Error("Failed to get instructor courses");
    }
  }

  async deleteCourse(courseId: string): Promise<ICourse | null> {
    return await this.delete(courseId);
  }
}
