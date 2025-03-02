// src/repositories/ICourseRepository.ts
import { ICourse } from "../../models/Course";
import { CreateCourseInput } from "../../utils/course.dto";

export interface ICourseRepository {
  createCourse(data: CreateCourseInput): Promise<ICourse>;
  findCourseById(courseId: string): Promise<ICourse | null>;
  updateCourse(
    courseId: string,
    data: Partial<ICourse>
  ): Promise<ICourse | null>;
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
    category?: string,
    difficulty?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    excludeInstructorId?: string
  ): Promise<{ courses: ICourse[]; totalCourses: number; totalPages?: number }>;
  getCourseDetails(courseId: string): Promise<ICourse | null>;
  getInstructorCourses(
    filter: { instructorId: string; title: any },
    page: number,
    limit: number,
    sortOptions: { [key: string]: 1 | -1 }
  ): Promise<{ courses: ICourse[]; totalCourses: number }>;
  deleteCourse(courseId: string): Promise<ICourse | null>;
}
