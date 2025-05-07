import razorpay from "../utils/razorpay";
import { IPaymentRepository } from "../repositories/interfaces/IPaymentRepository";
import { IEnrollmentRepository } from "../repositories/interfaces/IEnrollmentRepository";
import { AppError } from "../utils/appError";
import { IPayment } from "../models/Payment";
import { IPaymentService } from "./interfaces/IPaymentService";
import { ICourseService } from "./interfaces/ICourseService";
import { PaymentLock } from "../models/PaymentLock";
import mongoose from "mongoose";

export class PaymentService implements IPaymentService {
  constructor(
    private paymentRepo: IPaymentRepository,
    private enrollmentRepo: IEnrollmentRepository,
    private courseService: ICourseService
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
  }): Promise<any> {
    const { amount, courses, userId, userName, userEmail } = orderData;
    const lockTimeout = new Date(Date.now() + 10000); // 10s expiration

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Step 1: Acquire locks for all courses
      for (const course of courses) {
        const lockKey = { userId, courseId: course.courseId };
        const existingLock = await PaymentLock.findOne(lockKey).session(
          session
        );
        if (existingLock) {
          throw new AppError(
            "Another payment process is in progress for this course. Please wait.",
            409
          );
        }
        await PaymentLock.create(
          [{ userId, courseId: course.courseId, expiresAt: lockTimeout }],
          {
            session,
          }
        );
      }

      // Step 2: Check enrollment status
      for (const course of courses) {
        const isEnrolled = await this.enrollmentRepo.isUserEnrolled(
          userId,
          course.courseId
        );
        if (isEnrolled) {
          throw new AppError(
            `You are already enrolled in "${course.courseTitle}"`,
            400
          );
        }
      }

      // Step 3: Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: amount * 100,
        currency: "INR",
      });

      // Step 4: Store payment record
      await this.paymentRepo.createPayment({
        userId,
        userName,
        userEmail,
        orderId: razorpayOrder.id,
        paymentMethod: "razorpay",
        amount,
        courses,
        paymentStatus: "pending",
        orderStatus: "pending",
      });

      await session.commitTransaction();
      return razorpayOrder;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
      // Clean up locks immediately after order creation attempt
      for (const course of courses) {
        await PaymentLock.deleteOne({
          userId,
          courseId: course.courseId,
        }).catch((err) =>
          console.error(
            `Failed to delete lock for ${userId}:${course.courseId}:`,
            err
          )
        );
      }
    }
  }

  async verifyRazorpayPayment(paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
  }): Promise<{ success: boolean }> {
    const { razorpay_payment_id, razorpay_order_id } = paymentData;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
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

      const { userId, courses } = updatedPayment;

      // Double-check enrollment before proceeding
      for (const course of courses) {
        const isEnrolled = await this.enrollmentRepo.isUserEnrolled(
          userId,
          course.courseId
        );
        if (isEnrolled) {
          throw new AppError(
            `You are already enrolled in "${course.courseTitle}"`,
            400
          );
        }
      }

      // Enroll user
      await this.enrollmentRepo.enrollUserInCourses(userId, courses);

      // Update course stats
      for (const course of courses) {
        await this.courseService.updateCourseEnrollment(course.courseId, {
          studentId: userId,
          studentName: updatedPayment.userName,
          studentEmail: updatedPayment.userEmail,
          paidAmount: course.coursePrice,
        });
      }

      await session.commitTransaction();
      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getAllPayments(
    page: number,
    limit: number
  ): Promise<{ payments: IPayment[]; totalPages: number }> {
    return await this.paymentRepo.getAllPayments(page, limit);
  }

  async getPaymentsByDate(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number
  ): Promise<{ payments: IPayment[]; totalPages: number }> {
    return await this.paymentRepo.getPaymentsByDateRange(
      startDate,
      endDate,
      page,
      limit
    );
  }

  async getUserPaymentHistory(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ payments: IPayment[]; totalPages: number }> {
    return await this.paymentRepo.getUserPaymentHistory(userId, page, limit);
  }
}
