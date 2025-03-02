import { IEnrollment } from "../../models/Enrollment";

export interface IEnrollmentService {
  fetchEnrolledCourses(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ courses: IEnrollment["courses"]; totalPages: number }>;
  checkEnrolled(userId: string, courseId: string): Promise<boolean>;
}
