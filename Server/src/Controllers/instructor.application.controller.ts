import { Request, Response, NextFunction } from "express";
import { InstructorApplicationService } from "../services/instructorApplication.service";
import { errorResponse, successResponse } from "../utils/responseHandler";
import mongoose from "mongoose";

const instructorApplicationService = new InstructorApplicationService();

interface CustomRequest extends Request {
  user?: {
    id: string;
  };
}

export class InstructorApplicationController {
  static async applyForInstructor(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        errorResponse(res, "User ID is required.", 400);
      }
      console.log(req.body);
      const application = await instructorApplicationService.applyForInstructor(
        userId,
        req.body
      );
      successResponse(
        res,
        application,
        "Application submitted successfully.",
        201
      );
    } catch (error: any) {
      console.log(error);
      errorResponse(res, error.message, 400);
    }
  }

  static async getApplications(req: Request, res: Response) {
    const { page = 1, limit = 10 } = req.query;
    try {
      const { applications, totalPages } =
        await instructorApplicationService.getInstructorApplications(
          page as number,
          limit as number
        );
      successResponse(
        res,
        { applications, totalPages },
        "Instructor applications fetched successfully.",
        200
      );
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async reviewApplication(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { applicationId } = req.params;
      const { status, rejectionReason } = req.body;
      console.log(applicationId, status, rejectionReason);

      if (!mongoose.Types.ObjectId.isValid(applicationId)) {
        errorResponse(res, "Invalid application ID.", 400);
      }

      const updatedApplication =
        await instructorApplicationService.reviewApplication(
          applicationId,
          status,
          rejectionReason
        );
      successResponse(
        res,
        updatedApplication,
        "Application reviewed successfully.",
        200
      );
    } catch (error: any) {
      console.log(error);
      errorResponse(res, error.message, 400);
    }
  }

  static async getApplication(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        errorResponse(res, "Unauthorized", 400);
      }
      const application = await instructorApplicationService.getApplication(
        userId
      );
      successResponse(
        res,
        application,
        "Instructor application fetched successfully.",
        200
      );
    } catch (error: any) {
      console.log(error);
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }
  static async getInstructorDetails(req: Request, res: Response) {
    try {
      const userId = req.params.instructorId;

      const application = await instructorApplicationService.getApplication(
        userId
      );
      successResponse(
        res,
        application,
        "Instructor Details fetched successfully.",
        200
      );
    } catch (error: any) {
      console.log(error);
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }

  static async getApplicationDetails(req: Request, res: Response) {
    try {
      const { applicationId } = req.params;
      const applicationDetails =
        await instructorApplicationService.getApplicationDetails(applicationId);
      successResponse(
        res,
        applicationDetails,
        "Instructor application details fetched successfully.",
        200
      );
    } catch (error: any) {
      console.log(error);
      errorResponse(res, error.message, 400);
    }
  }
}
