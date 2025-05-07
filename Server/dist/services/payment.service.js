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
const razorpay_1 = __importDefault(require("../utils/razorpay"));
const appError_1 = require("../utils/appError");
const PaymentLock_1 = require("../models/PaymentLock");
const mongoose_1 = __importDefault(require("mongoose"));
class PaymentService {
    constructor(paymentRepo, enrollmentRepo, courseService) {
        this.paymentRepo = paymentRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.courseService = courseService;
    }
    createRazorpayOrder(orderData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { amount, courses, userId, userName, userEmail } = orderData;
            const lockTimeout = new Date(Date.now() + 10000); // 10s expiration
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                // Step 1: Acquire locks for all courses
                for (const course of courses) {
                    const lockKey = { userId, courseId: course.courseId };
                    const existingLock = yield PaymentLock_1.PaymentLock.findOne(lockKey).session(session);
                    if (existingLock) {
                        throw new appError_1.AppError("Another payment process is in progress for this course. Please wait.", 409);
                    }
                    yield PaymentLock_1.PaymentLock.create([{ userId, courseId: course.courseId, expiresAt: lockTimeout }], {
                        session,
                    });
                }
                // Step 2: Check enrollment status
                for (const course of courses) {
                    const isEnrolled = yield this.enrollmentRepo.isUserEnrolled(userId, course.courseId);
                    if (isEnrolled) {
                        throw new appError_1.AppError(`You are already enrolled in "${course.courseTitle}"`, 400);
                    }
                }
                // Step 3: Create Razorpay order
                const razorpayOrder = yield razorpay_1.default.orders.create({
                    amount: amount * 100,
                    currency: "INR",
                });
                // Step 4: Store payment record
                yield this.paymentRepo.createPayment({
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
                yield session.commitTransaction();
                return razorpayOrder;
            }
            catch (error) {
                yield session.abortTransaction();
                throw error;
            }
            finally {
                session.endSession();
                // Clean up locks immediately after order creation attempt
                for (const course of courses) {
                    yield PaymentLock_1.PaymentLock.deleteOne({
                        userId,
                        courseId: course.courseId,
                    }).catch((err) => console.error(`Failed to delete lock for ${userId}:${course.courseId}:`, err));
                }
            }
        });
    }
    verifyRazorpayPayment(paymentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { razorpay_payment_id, razorpay_order_id } = paymentData;
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
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
                const { userId, courses } = updatedPayment;
                // Double-check enrollment before proceeding
                for (const course of courses) {
                    const isEnrolled = yield this.enrollmentRepo.isUserEnrolled(userId, course.courseId);
                    if (isEnrolled) {
                        throw new appError_1.AppError(`You are already enrolled in "${course.courseTitle}"`, 400);
                    }
                }
                // Enroll user
                yield this.enrollmentRepo.enrollUserInCourses(userId, courses);
                // Update course stats
                for (const course of courses) {
                    yield this.courseService.updateCourseEnrollment(course.courseId, {
                        studentId: userId,
                        studentName: updatedPayment.userName,
                        studentEmail: updatedPayment.userEmail,
                        paidAmount: course.coursePrice,
                    });
                }
                yield session.commitTransaction();
                return { success: true };
            }
            catch (error) {
                yield session.abortTransaction();
                throw error;
            }
            finally {
                session.endSession();
            }
        });
    }
    getAllPayments(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.paymentRepo.getAllPayments(page, limit);
        });
    }
    getPaymentsByDate(startDate, endDate, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.paymentRepo.getPaymentsByDateRange(startDate, endDate, page, limit);
        });
    }
    getUserPaymentHistory(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.paymentRepo.getUserPaymentHistory(userId, page, limit);
        });
    }
}
exports.PaymentService = PaymentService;
