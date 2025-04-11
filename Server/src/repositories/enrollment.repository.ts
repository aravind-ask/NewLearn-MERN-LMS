// src/repositories/EnrollmentRepository.ts
import EnrollmentModel, { IEnrollment } from "../models/Enrollment";
import { IEnrollmentRepository } from "./interfaces/IEnrollmentRepository";
import { BaseRepository } from "./base.repository"; 

export class EnrollmentRepository
  extends BaseRepository<IEnrollment>
  implements IEnrollmentRepository
{
  constructor() {
    super(EnrollmentModel);
  }

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
      const enrollment = await this.model
        .findOneAndUpdate(
          { userId },
          { $addToSet: { courses: { $each: courses } } },
          { upsert: true, new: true }
        )
        .exec();
      return enrollment;
    } catch (error) {
      console.error("Error enrolling user in courses:", error);
      throw new Error("Error enrolling user in courses");
    }
  }

  async isCourseEnrolled(userId: string, courseId: string): Promise<boolean> {
    try {
      const exists = await this.model.exists({
        userId,
        "courses.courseId": courseId,
      });
      return !!exists;
    } catch (error) {
      console.error("Error checking course enrollment:", error);
      throw new Error("Error checking course enrollment");
    }
  }

  async getEnrolledCourses(userId: string): Promise<IEnrollment | null> {
    try {
      return await this.findOne({ userId }, [
        "courses.courseProgressId",
        "courses.courseId",
      ]);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      throw new Error("Error fetching enrolled courses");
    }
  }

  async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    try {
      const enrollment = await this.findOne({ userId, courseId });
      return !!enrollment;
    } catch (error) {
      console.error("Error checking enrollment:", error);
      throw new Error("Failed to check enrollment");
    }
  }

}

export default EnrollmentRepository;
