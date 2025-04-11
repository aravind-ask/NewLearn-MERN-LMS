// src/repositories/interfaces/ICourseProgressRepository.ts
import { ICourseProgress } from "../../models/CourseProgress";

export interface ICourseProgressRepository {
  findCourseProgress(
    userId: string,
    courseId: string
  ): Promise<ICourseProgress | null>;
  createCourseProgress(
    courseProgress: Partial<ICourseProgress>
  ): Promise<ICourseProgress>;
  updateLectureProgress(
    userId: string,
    courseId: string,
    lectureId: string
  ): Promise<ICourseProgress>;
  markCourseAsCompleted(
    userId: string,
    courseId: string
  ): Promise<ICourseProgress | null>;
  resetCourseProgress(
    userId: string,
    courseId: string
  ): Promise<ICourseProgress | null>;
}
