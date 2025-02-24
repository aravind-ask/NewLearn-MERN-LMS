import { ParsedQs } from "qs";
import { CourseRepository } from "../repositories/course.repository";
import { CreateCourseInput, EditCourseInput } from "../utils/course.dto";
import { ICourse } from "../models/Course";

export class CourseService {
  private courseRepo: CourseRepository;

  constructor() {
    this.courseRepo = new CourseRepository();
  }

  async createCourse(data: CreateCourseInput): Promise<ICourse> {
    try {
      return await this.courseRepo.createCourse(data);
    } catch (error) {
      console.error("Service Error creating course:", error);
      throw new Error("Service failed to create course");
    }
  }

  async editCourse(data: EditCourseInput): Promise<ICourse | null> {
    try {
      const { courseId, ...updateData } = data;
      return await this.courseRepo.updateCourse(courseId, updateData);
    } catch (error) {
      console.error("Service Error editing course:", error);
      throw new Error("Service failed to edit course");
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
  ) {
    try {
      return await this.courseRepo.updateCourseEnrollment(courseId, data);
    } catch (error) {
      console.error("Service Error updating course enrollment:", error);
      throw new Error("Service failed to update course enrollment");
    }
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
  ) {
    try {
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
    } catch (error) {
      console.error("Service Error getting all courses:", error);
      throw new Error("Service failed to get all courses");
    }
  }

  async getCourseDetails(courseId: string): Promise<ICourse | null> {
    try {
      return await this.courseRepo.getCourseDetails(courseId);
    } catch (error) {
      console.error("Service Error getting course details:", error);
      throw new Error("Service failed to get course details");
    }
  }

  async fetchInstructorCourses(
    filter: {
      instructorId: string;
      title: {
        $regex: string | ParsedQs | (string | ParsedQs)[];
        $options: string;
      };
    },
    page: number,
    limit: number,
    sortOptions: { [key: string]: 1 | -1 }
  ) {
    if (!filter.instructorId) {
      throw new Error("Instructor ID is required");
    }

    try {
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
    } catch (error) {
      console.error("Service Error fetching instructor courses:", error);
      throw new Error("Service failed to fetch instructor courses");
    }
  }

  async deleteCourse(courseId: string): Promise<ICourse | null> {
    try {
      return await this.courseRepo.deleteCourse(courseId);
    } catch (error) {
      console.error("Service Error deleting course:", error);
      throw new Error("Service failed to delete course");
    }
  }
}
