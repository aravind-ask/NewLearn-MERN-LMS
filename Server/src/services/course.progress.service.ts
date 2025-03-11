import { CourseProgressRepository } from "../repositories/course.progress.repository";
import EnrollmentModel from "../models/Enrollment";
import { CourseRepository } from "../repositories/course.repository";

export class CourseProgressService {
  private courseProgressRepository: CourseProgressRepository;
  private courseRepo: CourseRepository;

  constructor() {
    this.courseProgressRepository = new CourseProgressRepository();
    this.courseRepo = new CourseRepository();
  }

  async markCurrentLectureAsViewed(
    userId: string,
    courseId: string,
    lectureId: string
  ) {
    const progress = await this.courseProgressRepository.updateLectureProgress(
      userId,
      courseId,
      lectureId
    );

    const course = await this.courseRepo.getCourseDetails(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const allLecturesViewed =
      progress.lecturesProgress.length === course.curriculum.length &&
      progress.lecturesProgress.every((item) => item.viewed);

    if (allLecturesViewed) {
      await this.courseProgressRepository.markCourseAsCompleted(
        userId,
        courseId
      );
    }

    return progress;
  }

  async getCurrentCourseProgress(userId: string, courseId: string) {
    const studentPurchasedCourses = await EnrollmentModel.findOne({ userId });

    const isCoursePurchased = studentPurchasedCourses?.courses.some(
      (item) => item.courseId === courseId
    );

    if (!isCoursePurchased) {
      return {
        isPurchased: false,
        message: "You need to purchase this course to access it.",
      };
    }

    const progress = await this.courseProgressRepository.findCourseProgress(
      userId,
      courseId
    );

    if (!progress || progress.lecturesProgress.length === 0) {
      const course = await this.courseRepo.getCourseDetails(courseId);

      if (!course) {
        throw new Error("Course not found");
      }

      return {
        courseDetails: course,
        progress: [],
        isPurchased: true,
        message: "No progress found, you can start watching the course.",
      };
    }

    const courseDetails = await this.courseRepo.getCourseDetails(courseId);

    return {
      courseDetails,
      progress: progress.lecturesProgress,
      completed: progress.completed,
      completionDate: progress.completionDate,
      isPurchased: true,
    };
  }

  async resetCurrentCourseProgress(userId: string, courseId: string) {
    return this.courseProgressRepository.resetCourseProgress(userId, courseId);
  }
}
