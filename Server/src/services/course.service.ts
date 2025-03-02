// src/services/course.service.ts
import { ICourseRepository } from "../repositories/interfaces/ICourseRepository";
import { ICourse } from "../models/Course";
import { ICourseService } from "./interfaces/ICourseService";
import { CreateCourseInput, EditCourseInput } from "../utils/course.dto";
import mongoose from "mongoose";

export class CourseService implements ICourseService {
  constructor(private courseRepo: ICourseRepository) {}

  async createCourse(courseCreationData: CreateCourseInput): Promise<ICourse> {
    return await this.courseRepo.createCourse(courseCreationData);
  }

  async editCourse(courseEditData: EditCourseInput): Promise<ICourse | null> {
    const { courseId, ...updateData } = courseEditData;
    const courseData = {
      ...courseEditData,
      category: new mongoose.Types.ObjectId(courseEditData.category),
    };
    return await this.courseRepo.updateCourse(courseId, courseData);
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
    return await this.courseRepo.updateCourseEnrollment(courseId, data);
  }

  async getAllCourses(
    page: number,
    limit: number,
    search?: string,
    category?: string,
    difficulty?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    excludeInstructorId?: string
  ): Promise<{
    courses: ICourse[];
    totalCourses: number;
    totalPages?: number;
  }> {
    return await this.courseRepo.getAllCourses(
      page,
      limit,
      search,
      category,
      difficulty,
      sortBy,
      sortOrder,
      excludeInstructorId
    );
  }

  async getCourseDetails(courseId: string): Promise<ICourse | null> {
    return await this.courseRepo.getCourseDetails(courseId);
  }

  async fetchInstructorCourses(
    filter: { instructorId: string; title: any },
    page: number,
    limit: number,
    sortOptions: { [key: string]: 1 | -1 }
  ): Promise<{
    courses: ICourse[];
    totalCourses: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { courses, totalCourses } =
      await this.courseRepo.getInstructorCourses(
        filter,
        page,
        limit,
        sortOptions
      );
    return {
      courses,
      totalCourses,
      totalPages: Math.ceil(totalCourses / limit),
      currentPage: page,
    };
  }

  async deleteCourse(courseId: string): Promise<ICourse | null> {
    return await this.courseRepo.deleteCourse(courseId);
  }
}
