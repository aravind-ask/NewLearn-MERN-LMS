// src/services/enrollment.service.ts
import { IEnrollment } from "@/models/Enrollment";
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
    const enrollment = await this.enrollmentRepo.getEnrolledCourses(userId);
    if (!enrollment || !enrollment.courses.length) {
      return { courses: [], totalPages: 0 };
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCourses = enrollment.courses.slice(startIndex, endIndex);
    const totalPages = Math.ceil(enrollment.courses.length / limit);

    return { courses: paginatedCourses, totalPages };
  }

  async checkEnrolled(userId: string, courseId: string): Promise<boolean> {
    console.log("Checking enrollment");
    return await this.enrollmentRepo.isCourseEnrolled(userId, courseId);
  }
}

export default EnrollmentService; 
