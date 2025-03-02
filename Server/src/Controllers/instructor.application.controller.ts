// src/controllers/instructorApplication.controller.ts
import { Request, Response, NextFunction } from "express";
import { InstructorApplicationService } from "../services/instructorApplication.service";
import { errorResponse, successResponse } from "../utils/responseHandler";
import mongoose from "mongoose";

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
        201
      );
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
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
        200
      );
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 500);
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

      if (!mongoose.Types.ObjectId.isValid(applicationId)) {
        errorResponse(res, "Invalid application ID", 400);
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
        200
      );
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
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
        200
      );
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }

  async getInstructorDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { instructorId } = req.params;
      const application = await this.instructorAppService.getApplication(
        instructorId
      );
      successResponse(
        res,
        application,
        "Instructor details fetched successfully",
        200
      );
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }

  async getApplicationDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { applicationId } = req.params;
      const applicationDetails =
        await this.instructorAppService.getApplicationDetails(applicationId);
      successResponse(
        res,
        applicationDetails,
        "Instructor application details fetched successfully",
        200
      );
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }
}
