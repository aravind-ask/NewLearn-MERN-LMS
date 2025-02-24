// src/services/paymentService.ts
import razorpay from "../utils/razorpay";
import {
  createPayment,
  updatePaymentStatus,
} from "../repositories/payment.repository";
import { CourseService } from "./course.service";
import { enrollUserInCourses } from "../repositories/enrollment.repository";

const courseService = new CourseService();

export const createRazorpayOrder = async (orderData: {
  amount: number;
  courses: any[];
  userId: string;
  userName: string;
  userEmail: string;
}) => {
  const { amount, courses, userId, userName, userEmail } = orderData;

  // Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
  });

  // Create payment record in the database
  const payment = await createPayment({
    userId,
    userName,
    userEmail,
    orderId: razorpayOrder.id,
    paymentMethod: "razorpay",
    amount,
    courses,
  });

  return razorpayOrder;
};

export const verifyRazorpayPayment = async (paymentData: any) => {
  const { razorpay_payment_id, razorpay_order_id } = paymentData;

  console.log("Verifying payment with Razorpay...");
  console.log("Payment ID:", razorpay_payment_id);
  console.log("Order ID:", razorpay_order_id);

  try {
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    console.log("Razorpay payment details:", payment);

    if (payment.status === "captured") {
      console.log("Payment captured. Updating payment status...");

      const updatedPayment = await updatePaymentStatus(razorpay_order_id, {
        paymentId: razorpay_payment_id,
        orderStatus: "completed",
        paymentStatus: "completed",
      });

      console.log("Updated payment record:", updatedPayment);

      if (updatedPayment) {
        console.log("Enrolling user in courses...");

        const { userId, userName, userEmail, courses } = updatedPayment;
        const enrollment = await enrollUserInCourses(userId, courses);

        console.log("Enrollment result:", enrollment);

        for (let course of courses) {
          const data = {
            studentId: userId,
            studentName: userName,
            studentEmail: userEmail,
            paidAmount: course.coursePrice,
          };
          await courseService.updateCourseEnrollment(course.courseId, data);
        }

        return { success: true };
      } else {
        console.error(
          "Payment record not found for orderId:",
          razorpay_order_id
        );
        return { success: false };
      }
    } else {
      console.error("Payment not captured. Status:", payment.status);
      return { success: false };
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return { success: false };
  }
};
