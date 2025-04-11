// src/controllers/instructorApplication.controller.ts
import { Request, Response, NextFunction } from "express";
import { InstructorApplicationService } from "../services/instructorApplication.service";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { HttpStatus } from "../utils/statusCodes";
import { Types } from "mongoose";

interface CustomRequest extends Request {
  user?: { id: string };
}

export class InstructorApplicationController {
  constructor(private instructorAppService: InstructorApplicationService) {}

  async applyForInstructor(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      const application = await this.instructorAppService.applyForInstructor(
        userId,
        req.body
      );
      successResponse(
        res,
        application,
        "Application submitted successfully",
        HttpStatus.CREATED
      );
    } catch (error: any) {
      errorResponse(
        res,
        error.message,
        error.statusCode || HttpStatus.BAD_REQUEST
      );
    }
  }

  async updateApplication(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { applicationId } = req.params;
      const application = await this.instructorAppService.updateApplication(
        applicationId,
        req.body
      );
      successResponse(
        res,
        application,
        "Application updated successfully",
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

  async getApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "10" } = req.query;
      const { applications, totalPages } =
        await this.instructorAppService.getInstructorApplications(
          Number(page),
          Number(limit)
        );
      successResponse(
        res,
        { applications, totalPages },
        "Instructor applications fetched successfully",
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

  async reviewApplication(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { applicationId } = req.params;
      const { status, rejectionReason } = req.body;

      if (!Types.ObjectId.isValid(applicationId)) {
        errorResponse(res, "Invalid application ID", HttpStatus.BAD_REQUEST);
        return;
      }

      const updatedApplication =
        await this.instructorAppService.reviewApplication(
          applicationId,
          status,
          rejectionReason
        );
      successResponse(
        res,
        updatedApplication,
        "Application reviewed successfully",
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

  async getApplication(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const application = await this.instructorAppService.getApplication(
        userId
      );
      successResponse(
        res,
        application,
        "Instructor application fetched successfully",
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

  async getInstructorDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { instructorId } = req.params;
      if (!Types.ObjectId.isValid(instructorId)) {
        errorResponse(res, "Invalid instructor ID", HttpStatus.BAD_REQUEST);
        return;
      }

      const application = await this.instructorAppService.getInstructorDetails(
        instructorId
      );
      successResponse(
        res,
        application,
        "Instructor details fetched successfully",
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

  async getApplicationDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { applicationId } = req.params;
      if (!Types.ObjectId.isValid(applicationId)) {
        errorResponse(res, "Invalid application ID", HttpStatus.BAD_REQUEST);
        return;
      }

      const applicationDetails =
        await this.instructorAppService.getApplicationDetails(applicationId);
      successResponse(
        res,
        applicationDetails,
        "Instructor application details fetched successfully",
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

export default InstructorApplicationController;
