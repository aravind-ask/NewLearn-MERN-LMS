// src/controllers/course.controller.ts
import { NextFunction, Request, Response } from "express";
import {
  CreateCourseDto,
  EditCourseDto,
  CreateCourseInput,
  EditCourseInput,
} from "../utils/course.dto";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { tokenUtils } from "../utils/tokenUtils";
import { ICourseService } from "../services/interfaces/ICourseService";
import { IEnrollmentService } from "@/services/interfaces/IEnrollmentService";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export class CourseController {
  constructor(
    private courseService: ICourseService,
    private enrollmentService: IEnrollmentService
  ) {}

  async createCourse(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const courseData: CreateCourseInput = CreateCourseDto.parse(req.body);
      if (!req.user) throw new Error("Unauthorized");
      courseData.instructorId = req.user.id;
      // courseData.instructorName =
      //   req.user.role === "instructor" ? "Instructor Name" : "";

      const newCourse = await this.courseService.createCourse(courseData);
      successResponse(res, newCourse, "Course created successfully", 201);
    } catch (error: any) {
      errorResponse(res, error, error.status || 400);
    }
  }

  async editCourse(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const validatedData: EditCourseInput = EditCourseDto.parse(req.body);

      const updatedCourse = await this.courseService.editCourse(validatedData);
      if (!updatedCourse) {
        errorResponse(res, { message: "Course not found" }, 404);
        return;
      }
      successResponse(res, updatedCourse, "Course updated successfully", 200);
    } catch (error: any) {
      errorResponse(res, error, error.status || 400);
    }
  }

  async deleteCourse(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { courseId } = req.params;
      const deletedCourse = await this.courseService.deleteCourse(courseId);
      if (!deletedCourse) {
        errorResponse(res, { message: "Course not found" }, 404);
        return;
      }
      successResponse(res, {}, "Course deleted successfully", 200);
    } catch (error: any) {
      errorResponse(res, error, error.status || 400);
    }
  }

  async getAllCourses(
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
          if (req.user?.role === "instructor") {
            excludeInstructorId = req.user.id;
          }
        } catch (error) {
          errorResponse(res, "Invalid or expired access token", 401);
          return;
        }
      }

      const result = await this.courseService.getAllCourses(
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

  // Get courses for a specific instructor
  async getInstructorCourses(
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
        instructorId,
        title: { $regex: search, $options: "i" },
      };

      const sortKey = typeof sortBy === "string" ? sortBy : "createdAt";
      const sortOptions: { [key: string]: 1 | -1 } = {};
      sortOptions[sortKey] = order === "desc" ? -1 : 1;

      const result = await this.courseService.fetchInstructorCourses(
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

  async getCourseDetails(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { courseId } = req.params;
      if (!courseId) {
        errorResponse(res, "Course not found", 404);
        return;
      }

      const authHeader = req.headers.authorization;
      let isCourseEnrolled = null;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = tokenUtils.verifyAccessToken(token);
          req.user = { id: decoded.userId, role: decoded.role };
          const isEnrolled = await this.enrollmentService.checkEnrolled(
            req.user.id,
            courseId
          );
          console.log("isEnrolled", isEnrolled);
          if (isEnrolled) {
            isCourseEnrolled = {
              courseId,
            };
          }
        } catch (error) {
          errorResponse(res, "Invalid or expired access token", 401);
          return;
        }
      }

      const courseDetails = await this.courseService.getCourseDetails(courseId);
      if (!courseDetails) {
        errorResponse(res, "Course not found", 404);
        return;
      }

      const course = { courseDetails, isEnrolled: isCourseEnrolled };
      successResponse(res, course, "Course details fetched successfully", 200);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }

  async checkCourseEnrollmentInfo(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        errorResponse(res, "Unauthorized", 401);
        return;
      }
      const { courseId } = req.params;
      const isEnrolled = await this.enrollmentService.checkEnrolled(
        req.user.id,
        courseId
      );
      successResponse(
        res,
        { isEnrolled },
        "Enrollment info fetched successfully",
        200
      );
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }
}
