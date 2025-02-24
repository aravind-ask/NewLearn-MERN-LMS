// src/controllers/paymentController.ts
import { Request, Response } from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/payment.service";
import { errorResponse, successResponse } from "../utils/responseHandler";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount, courses, userId, userName, userEmail } = req.body;
    console.log(req.body);
    const order = await createRazorpayOrder({
      amount,
      courses,
      userId,
      userName,
      userEmail,
    });
    successResponse(res, order, "Order created successfully", 200);
  } catch (error: any) {
    console.log(error);
    errorResponse(res, "Failed to create order", error.status || 500);
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { success } = await verifyRazorpayPayment(req.body);
    successResponse(res, { success }, "Payment verified successfully", 200);
  } catch (error: any) {
    console.log(error);
    errorResponse(res, "Payment verification failed", error.status || 500);
  }
};
