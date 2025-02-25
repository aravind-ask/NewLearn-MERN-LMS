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
    { $addToSet: { courses: { $each: courses } } },
    { upsert: true, new: true }
  );

  console.log("Enrollment result:", enrollment);
  return enrollment;
};

export const isCourseEnrolled = async (userID: string, courseId: string) => {
  const isEnrolled = await EnrollmentModel.exists({
    "courses.courseId": courseId,
  });
  return isEnrolled;
};

export const getEnrolledCourses = async (userId: string) => {
  return await EnrollmentModel.findOne({ userId });
  // return enrollment?.courses || [];
};
