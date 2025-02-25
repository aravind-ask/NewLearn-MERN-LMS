import { Request, Response } from "express";
import { CourseProgressService } from "../services/course.progress.service";
import { errorResponse, successResponse } from "../utils/responseHandler";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export class CourseProgressController {
  private courseProgressService: CourseProgressService;

  constructor(courseProgressService: CourseProgressService) {
    this.courseProgressService = courseProgressService;
  }

  async markCurrentLectureAsViewed(req: AuthenticatedRequest, res: Response) {
    try {
      const { courseId, lectureId } = req.body;
      const userId = req.user?.id!;

      const progress =
        await this.courseProgressService.markCurrentLectureAsViewed(
          userId,
          courseId,
          lectureId
        );

      successResponse(res, progress, "Lecture marked as viewed", 200);
    } catch (error: any) {
      console.error(error);

      errorResponse(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async getCurrentCourseProgress(req: AuthenticatedRequest, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = req.user?.id!;

      const result = await this.courseProgressService.getCurrentCourseProgress(
        userId,
        courseId
      );

      successResponse(res, result, "Course progress retrieved", 200);
    } catch (error: any) {
      console.error(error);
      errorResponse(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async resetCurrentCourseProgress(req: AuthenticatedRequest, res: Response) {
    try {
      const { courseId } = req.body;
      const userId = req.user?.id!;

      const progress =
        await this.courseProgressService.resetCurrentCourseProgress(
          userId,
          courseId
        );
      successResponse(res, progress, "Course progress has been reset", 200);
    } catch (error: any) {
      console.error(error);
      errorResponse(
        res,
        error.message || "Some error occurred!",
        error.status || 500
      );
    }
  }
}
