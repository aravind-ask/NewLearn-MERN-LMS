// src/services/payment.service.ts
import razorpay from "../utils/razorpay";
import { IPaymentRepository } from "../repositories/interfaces/IPaymentRepository";
import { IEnrollmentRepository } from "../repositories/interfaces/IEnrollmentRepository";
import { CourseService } from "./course.service";
import { AppError } from "../utils/appError";
import { IPayment } from "@/models/Payment";

export class PaymentService {
  constructor(
    private paymentRepo: IPaymentRepository,
    private enrollmentRepo: IEnrollmentRepository,
    private courseService: CourseService
  ) {}

  async createRazorpayOrder(orderData: {
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
  }) {
    const { amount, courses, userId, userName, userEmail } = orderData;

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
    });

    await this.paymentRepo.createPayment({
      userId,
      userName,
      userEmail,
      orderId: razorpayOrder.id,
      paymentMethod: "razorpay",
      amount,
      courses,
    });

    return razorpayOrder;
  }

  async verifyRazorpayPayment(paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
  }): Promise<{ success: boolean }> {
    const { razorpay_payment_id, razorpay_order_id } = paymentData;

    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.status !== "captured") {
      throw new AppError("Payment not captured", 400);
    }

    const updatedPayment = await this.paymentRepo.updatePaymentStatus(
      razorpay_order_id,
      {
        paymentId: razorpay_payment_id,
        orderStatus: "completed",
        paymentStatus: "completed",
      }
    );

    if (!updatedPayment) {
      throw new AppError("Payment record not found", 404);
    }

    const { userId, userName, userEmail, courses } = updatedPayment;
    await this.enrollmentRepo.enrollUserInCourses(userId, courses);

    for (const course of courses) {
      await this.courseService.updateCourseEnrollment(course.courseId, {
        studentId: userId,
        studentName: userName,
        studentEmail: userEmail,
        paidAmount: course.coursePrice,
      });
    }

    return { success: true };
  }

  async getAllPayments(): Promise<IPayment[]> {
    return await this.paymentRepo.getAllPayments();
  }

  async getPaymentsByDate(startDate: Date, endDate: Date): Promise<IPayment[]> {
    return await this.paymentRepo.getPaymentsByDateRange(startDate, endDate);
  }
  async getUserPaymentHistory(userId: string, page: number, limit: number) {
    return await this.paymentRepo.getUserPaymentHistory(userId, page, limit);
  }
}
