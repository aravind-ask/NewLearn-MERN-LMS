"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
// src/services/payment.service.ts
const razorpay_1 = __importDefault(require("../utils/razorpay"));
const appError_1 = require("../utils/appError");
class PaymentService {
    constructor(paymentRepo, enrollmentRepo, courseService) {
        this.paymentRepo = paymentRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.courseService = courseService;
    }
    createRazorpayOrder(orderData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { amount, courses, userId, userName, userEmail } = orderData;
            const razorpayOrder = yield razorpay_1.default.orders.create({
                amount: amount * 100, // Convert to paise
                currency: "INR",
            });
            yield this.paymentRepo.createPayment({
                userId,
                userName,
                userEmail,
                orderId: razorpayOrder.id,
                paymentMethod: "razorpay",
                amount,
                courses,
            });
            return razorpayOrder;
        });
    }
    verifyRazorpayPayment(paymentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { razorpay_payment_id, razorpay_order_id } = paymentData;
            const payment = yield razorpay_1.default.payments.fetch(razorpay_payment_id);
            if (payment.status !== "captured") {
                throw new appError_1.AppError("Payment not captured", 400);
            }
            const updatedPayment = yield this.paymentRepo.updatePaymentStatus(razorpay_order_id, {
                paymentId: razorpay_payment_id,
                orderStatus: "completed",
                paymentStatus: "completed",
            });
            if (!updatedPayment) {
                throw new appError_1.AppError("Payment record not found", 404);
            }
            const { userId, userName, userEmail, courses } = updatedPayment;
            yield this.enrollmentRepo.enrollUserInCourses(userId, courses);
            for (const course of courses) {
                yield this.courseService.updateCourseEnrollment(course.courseId, {
                    studentId: userId,
                    studentName: userName,
                    studentEmail: userEmail,
                    paidAmount: course.coursePrice,
                });
            }
            return { success: true };
        });
    }
    getAllPayments() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.paymentRepo.getAllPayments();
        });
    }
    getPaymentsByDate(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.paymentRepo.getPaymentsByDateRange(startDate, endDate);
        });
    }
    getUserPaymentHistory(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.paymentRepo.getUserPaymentHistory(userId, page, limit);
        });
    }
}
exports.PaymentService = PaymentService;
