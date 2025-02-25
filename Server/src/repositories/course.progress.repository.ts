import CourseProgress from "../models/CourseProgress";

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
      });
      return newProgress.save();
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
