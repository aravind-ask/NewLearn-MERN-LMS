import {
  getEnrolledCourses,
  isCourseEnrolled,
} from "../repositories/enrollment.repository";

export const fetchEnrolledCourses = async (
  userId: string,
  page: number,
  limit: number
) => {
  const enrolled = await getEnrolledCourses(userId);
  if (!enrolled) {
    return { courses: [], totalPages: 0 };
  }
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedCourses = enrolled.courses.slice(startIndex, endIndex);
  const totalPages = Math.ceil(enrolled.courses.length / limit);

  return { courses: paginatedCourses, totalPages };
};

export const checkEnrolled = async (userId: string, courseId: string) => {
  const isEnrolled = await isCourseEnrolled(userId, courseId);
  return isEnrolled;
};
