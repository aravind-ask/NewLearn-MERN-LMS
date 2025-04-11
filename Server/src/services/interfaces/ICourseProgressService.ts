// src/services/interfaces/ICourseProgressService.ts
import { ICourseProgress } from "../../models/CourseProgress";

export interface ICourseProgressService {
  markCurrentLectureAsViewed(
    userId: string,
    courseId: string,
    lectureId: string
  ): Promise<ICourseProgress>;
  getCurrentCourseProgress(userId: string, courseId: string): Promise<any>; // Flexible return type
  resetCurrentCourseProgress(
    userId: string,
    courseId: string
  ): Promise<ICourseProgress | null>;
}
