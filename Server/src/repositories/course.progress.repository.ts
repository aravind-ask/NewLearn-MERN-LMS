import Enrollment from "../models/Enrollment";
import CourseProgress from "../models/CourseProgress";
import { Course } from "../models/Course";

export class CourseProgressRepository {
  async findCourseProgress(userId: string, courseId: string) {
    return CourseProgress.findOne({ userId, courseId });
  }

  async createCourseProgress(courseProgress: any) {
    return CourseProgress.create(courseProgress);
  }

  async updateLectureProgress(
    userId: string,
    courseId: string,
    lectureId: string
  ) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error("Course not found");
    }
    const totalLectures = course.curriculum.reduce((total, section) => {
      return total + section.lectures.length;
    }, 0);
    const progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      const newProgress = new CourseProgress({
        userId,
        courseId,
        lecturesProgress: [
          {
            lectureId,
            viewed: true,
            dateViewed: new Date(),
          },
        ],
        totalLectures,
        viewedLectures: 1,
      });
      await newProgress.save();

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
        lectureId: lectureId,
        viewed: true,
        dateViewed: new Date(),
      });
      progress.viewedLectures = progress.viewedLectures + 1;
    }

    return progress.save();
  }

  async markCourseAsCompleted(userId: string, courseId: string) {
    return CourseProgress.findOneAndUpdate(
      { userId, courseId },
      { completed: true, completionDate: new Date() },
      { new: true }
    );
  }

  async resetCourseProgress(userId: string, courseId: string) {
    return CourseProgress.findOneAndUpdate(
      { userId, courseId },
      { lecturesProgress: [], completed: false, completionDate: null },
      { new: true }
    );
  }
}
