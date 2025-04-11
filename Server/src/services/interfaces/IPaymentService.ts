// src/services/interfaces/IPaymentService.ts
import { IPayment } from "../../models/Payment";
import { ICourseService } from "./ICourseService";

export interface IPaymentService {
  createRazorpayOrder(orderData: {
    amount: number;
    courses: {
      courseId: string;
      courseTitle: string;
      courseImage: string;
      coursePrice: number;
      instructorId: string;
      instructorName: string;
    }[];
    userId: string;
    userName: string;
    userEmail: string;
  }): Promise<any>; 
  verifyRazorpayPayment(paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
  }): Promise<{ success: boolean }>;
  getAllPayments(): Promise<IPayment[]>;
  getPaymentsByDate(startDate: Date, endDate: Date): Promise<IPayment[]>;
  getUserPaymentHistory(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ payments: IPayment[]; totalPages: number }>;
}
