import { NextFunction, Request, Response } from "express";
import {
  CreateCourseDto,
  EditCourseDto,
  CreateCourseInput,
  EditCourseInput,
} from "../utils/course.dto";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { tokenUtils } from "../utils/tokenUtils";
import { HttpStatus } from "../utils/statusCodes";
import { ICourseService } from "../services/interfaces/ICourseService";
import { IEnrollmentService } from "../services/interfaces/IEnrollmentService";

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

      const newCourse = await this.courseService.createCourse(courseData);
      successResponse(
        res,
        newCourse,
        "Course created successfully",
        HttpStatus.CREATED
      );
    } catch (error: any) {
      errorResponse(res, error, error.status || HttpStatus.BAD_REQUEST);
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
        errorResponse(
          res,
          { message: "Course not found" },
          HttpStatus.NOT_FOUND
        );
        return;
      }
      successResponse(
        res,
        updatedCourse,
        "Course updated successfully",
        HttpStatus.OK
      );
    } catch (error: any) {
      errorResponse(res, error, error.status || HttpStatus.BAD_REQUEST);
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
        errorResponse(
          res,
          { message: "Course not found" },
          HttpStatus.NOT_FOUND
        );
        return;
      }
      successResponse(res, {}, "Course deleted successfully", HttpStatus.OK);
    } catch (error: any) {
      errorResponse(res, error, error.status || HttpStatus.BAD_REQUEST);
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
          errorResponse(
            res,
            "Invalid or expired access token",
            HttpStatus.UNAUTHORIZED
          );
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

      successResponse(
        res,
        result,
        "Courses fetched successfully",
        HttpStatus.OK
      );
    } catch (error: any) {
      errorResponse(res, error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  async getInstructorCourses(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
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
      successResponse(
        res,
        result,
        "Courses fetched successfully",
        HttpStatus.OK
      );
    } catch (error: any) {
      errorResponse(res, error, error.status || HttpStatus.BAD_REQUEST);
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
        errorResponse(res, "Course not found", HttpStatus.NOT_FOUND);
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
          if (isEnrolled) {
            isCourseEnrolled = { courseId };
          }
        } catch (error) {
          errorResponse(
            res,
            "Invalid or expired access token",
            HttpStatus.UNAUTHORIZED
          );
          return;
        }
      }

      const courseDetails = await this.courseService.getCourseDetails(courseId);
      if (!courseDetails) {
        errorResponse(res, "Course not found", HttpStatus.NOT_FOUND);
        return;
      }

      const course = { courseDetails, isEnrolled: isCourseEnrolled };
      successResponse(
        res,
        course,
        "Course details fetched successfully",
        HttpStatus.OK
      );
    } catch (error: any) {
      errorResponse(
        res,
        error.message,
        error.statusCode || HttpStatus.BAD_REQUEST
      );
    }
  }

  async checkCourseEnrollmentInfo(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
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
        HttpStatus.OK
      );
    } catch (error: any) {
      errorResponse(
        res,
        error.message,
        error.statusCode || HttpStatus.BAD_REQUEST
      );
    }
  }
}
