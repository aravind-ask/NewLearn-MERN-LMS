// src/services/EnrollmentService.ts
import { IEnrollment } from "../models/Enrollment";
import { IEnrollmentRepository } from "../repositories/interfaces/IEnrollmentRepository";
import { IEnrollmentService } from "./interfaces/IEnrollmentService";

export class EnrollmentService implements IEnrollmentService {
  constructor(private enrollmentRepo: IEnrollmentRepository) {}

  async fetchEnrolledCourses(
    userId: string,
    page: number,
    limit: number
  ): Promise<{
    courses: IEnrollment["courses"];
    totalPages: number;
  }> {
    try {
      const enrollment = await this.enrollmentRepo.getEnrolledCourses(userId);
      if (!enrollment || !enrollment.courses.length) {
        return { courses: [], totalPages: 0 };
      }

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedCourses = enrollment.courses.slice(startIndex, endIndex);
      const totalPages = Math.ceil(enrollment.courses.length / limit);

      return { courses: paginatedCourses, totalPages };
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      throw new Error("Failed to fetch enrolled courses");
    }
  }

  async checkEnrolled(userId: string, courseId: string): Promise<boolean> {
    try {
      console.log("Checking enrollment");
      return await this.enrollmentRepo.isCourseEnrolled(userId, courseId);
    } catch (error) {
      console.error("Error checking enrollment:", error);
      throw new Error("Failed to check enrollment");
    }
  }
}

export default EnrollmentService;
