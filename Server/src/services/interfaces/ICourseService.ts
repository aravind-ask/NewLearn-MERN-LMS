// src/services/ICourseService.ts
import { ICourse } from "../../models/Course";
import { CreateCourseInput, EditCourseInput } from "../../utils/course.dto";

export interface ICourseService {
  createCourse(data: CreateCourseInput): Promise<ICourse>;
  editCourse(data: EditCourseInput): Promise<ICourse | null>;
  updateCourseEnrollment(
    courseId: string,
    data: {
      studentId: string;
      studentName: string;
      studentEmail: string;
      paidAmount: number;
    }
  ): Promise<ICourse | null>;
  getAllCourses(
    page: number,
    limit: number,
    search?: string,
    categoryId?: string,
    difficulty?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    excludeInstructorId?: string
  ): Promise<{ courses: ICourse[]; totalCourses: number; totalPages?: number }>;
  getCourseDetails(courseId: string): Promise<ICourse | null>;
  fetchInstructorCourses(
    filter: { instructorId: string; title: any },
    page: number,
    limit: number,
    sortOptions: { [key: string]: 1 | -1 }
  ): Promise<{
    courses: ICourse[];
    totalCourses: number;
    totalPages: number;
    currentPage: number;
  }>;
  deleteCourse(courseId: string): Promise<ICourse | null>;
}
