// src/repositories/CourseProgressRepository.ts
import { BaseRepository } from "./base.repository"; // Adjust path
import CourseProgress, { ICourseProgress } from "../models/CourseProgress";
import { ICourseProgressRepository } from "./interfaces/ICourseProgressRepository";
import Enrollment from "../models/Enrollment";
import { Course } from "../models/Course";

export class CourseProgressRepository
  extends BaseRepository<ICourseProgress>
  implements ICourseProgressRepository
{
  constructor() {
    super(CourseProgress);
  }

  async findCourseProgress(
    userId: string,
    courseId: string
  ): Promise<ICourseProgress | null> {
    try {
      return await this.findOne({ userId, courseId });
    } catch (error) {
      console.error("Error finding course progress:", error);
      throw new Error("Failed to find course progress");
    }
  }

  async createCourseProgress(
    courseProgress: Partial<ICourseProgress>
  ): Promise<ICourseProgress> {
    try {
      return await this.create(courseProgress);
    } catch (error) {
      console.error("Error creating course progress:", error);
      throw new Error("Failed to create course progress");
    }
  }

  async updateLectureProgress(
    userId: string,
    courseId: string,
    lectureId: string
  ): Promise<ICourseProgress> {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
      const totalLectures = course.curriculum.reduce((total, section) => {
        return total + section.lectures.length;
      }, 0);

      const progress = await this.findCourseProgress(userId, courseId);

      if (!progress) {
        const newProgress = await this.create({
          userId,
          courseId,
          lecturesProgress: [
            { lectureId, viewed: true, dateViewed: new Date() },
          ],
          totalLectures,
          viewedLectures: 1,
        });

        await Enrollment.findOneAndUpdate(
          { userId, "courses.courseId": courseId },
          { $set: { "courses.$.courseProgressId": newProgress._id } }
        );

        return newProgress;
      }

      const lectureProgress = progress.lecturesProgress.find(
        (item) => item.lectureId === lectureId
      );

      if (lectureProgress) {
        lectureProgress.viewed = true;
        lectureProgress.dateViewed = new Date();
      } else {
        progress.lecturesProgress.push({
          lectureId,
          viewed: true,
          dateViewed: new Date(),
        });
        progress.viewedLectures = progress.viewedLectures + 1;
      }

      return await progress.save();
    } catch (error) {
      console.error("Error updating lecture progress:", error);
      throw new Error("Failed to update lecture progress");
    }
  }

  async markCourseAsCompleted(
    userId: string,
    courseId: string
  ): Promise<ICourseProgress | null> {
    try {
      return await this.update(userId, {
        courseId,
        completed: true,
        completionDate: new Date(),
      });
    } catch (error) {
      console.error("Error marking course as completed:", error);
      throw new Error("Failed to mark course as completed");
    }
  }

  async resetCourseProgress(
    userId: string,
    courseId: string
  ): Promise<ICourseProgress | null> {
    try {
      return await this.update(userId, {
        courseId,
        lecturesProgress: [],
        completed: false,
        // completionDate: null,
        viewedLectures: 0,
      });
    } catch (error) {
      console.error("Error resetting course progress:", error);
      throw new Error("Failed to reset course progress");
    }
  }
}
