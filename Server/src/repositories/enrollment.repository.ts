// src/repositories/enrollmentRepository.ts
import EnrollmentModel, { IEnrollment } from "../models/Enrollment";

export const enrollUserInCourses = async (
  userId: string,
  courses: {
    courseId: string;
    courseTitle: string;
    courseImage: string;
    coursePrice: number;
    instructorId: string;
    instructorName: string;
  }[]
) => {
  console.log("Enrolling user:", userId);
  console.log("Courses to enroll:", courses);

  const enrollment = await EnrollmentModel.findOneAndUpdate(
    { userId },
    { $push: { courses: { $each: courses } } },
    { upsert: true, new: true }
  );

  console.log("Enrollment result:", enrollment);
  return enrollment;
};
