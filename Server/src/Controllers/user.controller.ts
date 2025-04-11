// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { getPresignedUploadUrl, getPresignedDownloadUrl } from "../config/s3.config";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { v4 as uuidv4 } from "uuid";
import EnrollmentService from "../services/enrollment.service";
import { IUser } from "../models/User";
import { HttpStatus } from "../utils/statusCodes";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export class UserController {
  constructor(
    private userService: UserService,
    private enrollmentService: EnrollmentService
  ) {}

  async getUploadUrl(req: Request, res: Response): Promise<void> {
    try {
      const { fileName } = req.body;
      if (!fileName) throw new Error("fileName is required");
      const { url, key } = await getPresignedUploadUrl(fileName);
      res.status(200).json({ url, key });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getDownloadUrl(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.body;
      if (!key) throw new Error("key is required");
      const url = await getPresignedDownloadUrl(key);
      res.status(200).json({ url });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        name,
        email,
        password,
        photoUrl,
        bio,
        phoneNumber,
        address,
        dateOfBirth,
        education,
      } = req.body;
      if (!req.user) {
        errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
        return;
      }

      const updatedUser = await this.userService.updateProfile(
        req.user.id,
        name,
        email,
        password,
        photoUrl,
        bio,
        phoneNumber,
        address,
        dateOfBirth ? new Date(dateOfBirth) : undefined,
        education
      );

      const userResponse = {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        photoUrl: updatedUser.photoUrl,
        bio: updatedUser.bio,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        dateOfBirth: updatedUser.dateOfBirth,
        education: updatedUser.education,
        isBlocked: updatedUser.isBlocked,
      };
      successResponse(
        res,
        userResponse,
        "Profile updated successfully",
        HttpStatus.OK
      );
    } catch (error: any) {
      errorResponse(
        res,
        error.message,
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = req.query.search as string | undefined;
      const { users, totalPages } = await this.userService.getUsers(
        page,
        limit,
        search
      );
      successResponse(
        res,
        { users, totalPages },
        "Users fetched successfully",
        HttpStatus.OK
      );
    } catch (error: any) {
      errorResponse(
        res,
        "Error fetching users",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async blockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, isBlocked } = req.body;
      const updatedUser = await this.userService.blockUser(userId, isBlocked);
      successResponse(
        res,
        updatedUser,
        `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
        HttpStatus.OK
      );
    } catch (error: any) {
      errorResponse(
        res,
        "Error updating block status",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getStudentCourses(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
        return;
      }
      const userId = req.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { courses, totalPages } =
        await this.enrollmentService.fetchEnrolledCourses(userId, page, limit);
      if (!courses.length) {
        errorResponse(
          res,
          "You have not enrolled to any courses yet. Enroll now and start learning",
          HttpStatus.NOT_FOUND
        );
        return;
      }
      successResponse(
        res,
        { courses, totalPages },
        "Student courses fetched successfully",
        200
      );
    } catch (error: any) {
      errorResponse(
        res,
        error.message || "Error fetching student courses",
        error.statusCode
      );
    }
  }

  async getUserStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
        return;
      }
      const user: IUser = await this.userService.getUserStatus(req.user.id);
      successResponse(
        res,
        { isBlocked: user.isBlocked },
        "User status fetched",
        HttpStatus.OK
      );
      // const data = {
      //   isBlocked: user.isBlocked,
      // };
      //  res.status(HttpStatus.OK).json(data);
      //  return
    } catch (error: any) {
      errorResponse(res, "Error fetching user status", error.statusCode);
    }
  }
}
