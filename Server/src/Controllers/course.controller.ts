import { NextFunction, Request, Response } from "express";
import { CourseService } from "../services/course.service";
import {
  CreateCourseDto,
  EditCourseDto,
  CreateCourseInput,
  EditCourseInput,
} from "../utils/course.dto";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { tokenUtils } from "../utils/tokenUtils"; // Import tokenUtils to verify token

const courseService = new CourseService();

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export class CourseController {
  static async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const courseData = req.body;

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
  static async getAllCourses(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        page = "1",
        limit = "10",
        search,
        category,
        difficulty,
        sortBy,
        sortOrder,
      } = req.query;

      let excludeInstructorId: string | undefined;

      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = tokenUtils.verifyAccessToken(token);
          req.user = { id: decoded.userId, role: decoded.role };
          console.log("user", req.user);
          if (req.user?.role === "instructor") {
            excludeInstructorId = req.user?.id;
          }
        } catch (error) {
          errorResponse(res, "Invalid or expired access token", 401);
          return;
        }
      }

      console.log("excludeInstructorId", excludeInstructorId);

      const result = await courseService.getAllCourses(
        Number(page),
        Number(limit),
        search as string,
        category as string,
        difficulty as string,
        sortBy as string,
        sortOrder as "asc" | "desc",
        excludeInstructorId
      );

      successResponse(res, result, "Courses fetched successfully", 200);
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
      const { sortBy = "createdAt", order = "desc", search = "" } = req.query;

      const filter = {
        instructorId: instructorId,
        title: { $regex: search, $options: "i" }, // Case-insensitive search
      };

      const sortKey = typeof sortBy === "string" ? sortBy : "createdAt";

      const sortOptions: { [key: string]: 1 | -1 } = {};
      sortOptions[sortKey] = order === "desc" ? -1 : 1;

      const result = await courseService.fetchInstructorCourses(
        filter,
        page,
        limit,
        sortOptions
      );
      successResponse(res, result, "Courses fetched successfully", 200);
    } catch (error: any) {
      errorResponse(res, error, error.status || 400);
    }
  }
  static async getCourseDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { courseId } = req.params;
      if (!courseId) {
        errorResponse(res, { message: "Course not found" }, 404);
      }
      const course = await courseService.getCourseDetails(courseId);
      successResponse(res, course, "Course details fetched successfully", 200);
    } catch (error: any) {
      errorResponse(res, error, error.status || 400);
    }
  }
}
