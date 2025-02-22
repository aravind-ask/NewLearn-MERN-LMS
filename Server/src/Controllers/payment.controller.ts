// src/controllers/paymentController.ts
import { Request, Response } from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/payment.service";
import { errorResponse, successResponse } from "../utils/responseHandler";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== "number") {
      throw new Error("Invalid amount");
    }
    const order = await createRazorpayOrder(amount);
    successResponse(
      res,
      { orderId: order.id },
      "Order created successfully",
      200
    );
  } catch (error: any) {
    console.log(error);
    errorResponse(res, "Failed to create order", error?.status || 500);
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { success } = await verifyRazorpayPayment(req.body);
    // res.status(200).json({ success });
    successResponse(res, { success }, "Payment verified successfully", 200);
  } catch (error: any) {
    // res.status(500).json({ message: "Payment verification failed" });
    errorResponse(res, "Payment verificationfailed", error.status || 500);
  }
};
