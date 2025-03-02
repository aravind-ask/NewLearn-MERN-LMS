// src/repositories/enrollment.repository.ts
import EnrollmentModel, { IEnrollment } from "../models/Enrollment";
import { IEnrollmentRepository } from "./interfaces/IEnrollmentRepository";

export class EnrollmentRepository implements IEnrollmentRepository {
  async enrollUserInCourses(
    userId: string,
    courses: {
      courseId: string;
      courseTitle: string;
      courseImage: string;
      coursePrice: number;
      instructorId: string;
      instructorName: string;
    }[]
  ): Promise<IEnrollment> {
    try {
      const enrollment = await EnrollmentModel.findOneAndUpdate(
        { userId },
        { $addToSet: { courses: { $each: courses } } },
        { upsert: true, new: true }
      ).exec();
      return enrollment;
    } catch (error) {
      throw new Error("Error enrolling user in courses");
    }
  }

  async isCourseEnrolled(userId: string, courseId: string): Promise<boolean> {
    try {
      const exists = await EnrollmentModel.exists({
        userId,
        "courses.courseId": courseId,
      });
      return !!exists;
    } catch (error) {
      throw new Error("Error checking course enrollment");
    }
  }

  async getEnrolledCourses(userId: string): Promise<IEnrollment | null> {
    try {
      return await EnrollmentModel.findOne({ userId }).exec();
    } catch (error) {
      throw new Error("Error fetching enrolled courses");
    }
  }
}
