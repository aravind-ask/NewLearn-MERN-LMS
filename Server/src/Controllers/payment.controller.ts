// src/controllers/PaymentController.ts
import { Request, Response, NextFunction } from "express";
import { IPaymentService } from "../services/interfaces/IPaymentService";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { HttpStatus } from "../utils/statusCodes";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export class PaymentController {
  constructor(private paymentService: IPaymentService) {}

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, courses, userId, userName, userEmail } = req.body;
      const order = await this.paymentService.createRazorpayOrder({
        amount,
        courses,
        userId,
        userName,
        userEmail,
      });
      successResponse(res, order, "Order created successfully", HttpStatus.OK);
    } catch (error: any) {
      errorResponse(
        res,
        error.message || "Failed to create order",
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { success } = await this.paymentService.verifyRazorpayPayment(
        req.body
      );
      successResponse(
        res,
        { success },
        "Payment verified successfully",
        HttpStatus.OK
      );
    } catch (error: any) {
      errorResponse(
        res,
        error.message || "Payment verification failed",
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await this.paymentService.getAllPayments();
      successResponse(
        res,
        payments,
        "Payments fetched successfully",
        HttpStatus.OK
      );
    } catch (error: any) {
      errorResponse(
        res,
        error.message || "Error fetching payments",
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getPaymentsByDateRange(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { startDate, endDate } = req.query;
      const payments = await this.paymentService.getPaymentsByDate(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      successResponse(
        res,
        payments,
        "Payments fetched successfully",
        HttpStatus.OK
      );
    } catch (error: any) {
      errorResponse(
        res,
        error.message || "Error fetching payments by date range",
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUserPaymentHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req?.user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { payments, totalPages } =
        await this.paymentService.getUserPaymentHistory(userId!, page, limit);
      successResponse(
        res,
        { payments, totalPages },
        "User payment history fetched successfully",
        HttpStatus.OK
      );
    } catch (error: any) {
      console.log(error);
      errorResponse(
        res,
        error.message || "Error fetching user payment history",
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
