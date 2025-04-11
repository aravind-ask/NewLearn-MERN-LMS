// src/services/CourseProgressService.ts
import { CourseProgressRepository } from "../repositories/course.progress.repository";
import { ICourseProgressService } from "./interfaces/ICourseProgressService";
import { CourseRepository } from "../repositories/course.repository";
import EnrollmentModel from "../models/Enrollment";
import { ICourseProgress } from "../models/CourseProgress";
import { ICourseProgressRepository } from "../repositories/interfaces/ICourseProgressRepository";
import { ICourseRepository } from "../repositories/interfaces/ICourseRepository";

export class CourseProgressService implements ICourseProgressService {
  private courseProgressRepository: ICourseProgressRepository;
  private courseRepo: ICourseRepository;

  constructor() {
    this.courseProgressRepository = new CourseProgressRepository();
    this.courseRepo = new CourseRepository();
  }

  async markCurrentLectureAsViewed(
    userId: string,
    courseId: string,
    lectureId: string
  ): Promise<ICourseProgress> {
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

  async getCurrentCourseProgress(
    userId: string,
    courseId: string
  ): Promise<any> {
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

  async resetCurrentCourseProgress(
    userId: string,
    courseId: string
  ): Promise<ICourseProgress | null> {
    return await this.courseProgressRepository.resetCourseProgress(
      userId,
      courseId
    );
  }
}
