import { NextFunction, Request, Response } from "express";
import { CourseService } from "../services/course.service";
import {
  CreateCourseDto,
  EditCourseDto,
  CreateCourseInput,
  EditCourseInput,
} from "../utils/course.dto";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { log } from "console";

const courseService = new CourseService();

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export class CourseController {
  static async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const courseData = req.body;
      console.log("CourseData", courseData);

      const validatedData = CreateCourseDto.parse(courseData);

      validatedData.pricing = Number(validatedData.pricing);

      const newCourse = await courseService.createCourse({
        ...validatedData,
      });

      successResponse(res, newCourse, "Course created Successfully", 201);
    } catch (error: any) {
      errorResponse(res, error, error.status || 400);
    }
  }

  static async editCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData: EditCourseInput = EditCourseDto.parse(req.body);
      const updatedCourse = await courseService.editCourse(validatedData);

      if (!updatedCourse) {
        errorResponse(res, { message: "Course not found" }, 404);
      }

      successResponse(res, updatedCourse, "Course updated successfully", 200);
    } catch (error: any) {
      errorResponse(res, error, error.status || 400);
    }
  }

  static async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const deletedCourse = await courseService.deleteCourse(courseId);

      if (!deletedCourse) {
        errorResponse(res, { message: "Course not found" }, 404);
      }

      successResponse(res, {}, "Course deleted successfully", 200);
    } catch (error: any) {
      errorResponse(res, error, error.status || 400);
    }
  }
  static async getInstructorCourses(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        errorResponse(res, "Unauthorized", 401);
        return;
      }
      const instructorId = req.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { sortBy = "createdAt", order = "desc" } = req.query;

      const sortKey = typeof sortBy === "string" ? sortBy : "createdAt";

      const sortOptions: { [key: string]: 1 | -1 } = {};
      sortOptions[sortKey] = order === "desc" ? -1 : 1;

      const result = await courseService.fetchInstructorCourses(
        instructorId,
        page,
        limit,
        sortOptions
      );
      successResponse(res, result, "Courses fetched successfully", 200);
    } catch (error: any) {
      errorResponse(res, error, error.status || 400);
    }
  }
}
