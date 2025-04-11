// src/repositories/IEnrollmentRepository.ts
import { IEnrollment } from "../../models/Enrollment";

export interface IEnrollmentRepository {
  enrollUserInCourses(
    userId: string,
    courses: {
      courseId: string;
      courseTitle: string;
      courseImage: string;
      coursePrice: number;
      instructorId: string;
      instructorName: string;
    }[]
  ): Promise<IEnrollment>;
  isCourseEnrolled(userId: string, courseId: string): Promise<boolean>;
  getEnrolledCourses(userId: string): Promise<IEnrollment | null>;
  isUserEnrolled(userId: string, courseId: string): Promise<boolean>;
}
