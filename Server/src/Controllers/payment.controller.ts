// src/controllers/payment.controller.ts
import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";
import { errorResponse, successResponse } from "../utils/responseHandler";

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

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
      successResponse(res, order, "Order created successfully", 200);
    } catch (error: any) {
      errorResponse(
        res,
        error.message || "Failed to create order",
        error.statusCode || 500
      );
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { success } = await this.paymentService.verifyRazorpayPayment(
        req.body
      );
      successResponse(res, { success }, "Payment verified successfully", 200);
    } catch (error: any) {
      errorResponse(
        res,
        error.message || "Payment verification failed",
        error.statusCode || 500
      );
    }
  }

  async getAllPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await this.paymentService.getAllPayments();
      successResponse(res, payments, "Payments fetched successfully", 200);
    } catch (error: any) {
      errorResponse(
        res,
        error.message || "Error fetching payments",
        error.statusCode || 500
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
      successResponse(res, payments, "Payments fetched successfully", 200);
    } catch (error: any) {
      errorResponse(
        res,
        error.message || "Error fetching payments by date range",
        error.statusCode || 500
      );
    }
  }
}
