// src/Routes/paymentRoutes.ts
import express, { Router } from "express";
import { PaymentRepository } from "../repositories/payment.repository";
import { EnrollmentRepository } from "../repositories/enrollment.repository";
import { CourseRepository } from "../repositories/course.repository";
import { CourseService } from "../services/course.service";
import { PaymentService } from "../services/payment.service";
import { PaymentController } from "../Controllers/payment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { OfferService } from "../services/offer.service";
import { OfferRepository } from "../repositories/offer.repository";

const paymentRepository = new PaymentRepository();
const enrollmentRepository = new EnrollmentRepository();
const courseRepository = new CourseRepository();
const offerService = new OfferService(new OfferRepository());
const courseService = new CourseService(new CourseRepository(), offerService);
const paymentService = new PaymentService(
  paymentRepository,
  enrollmentRepository,
  courseService
);
const paymentController = new PaymentController(paymentService);

const router: Router = express.Router();

// Routes
router.post(
  "/create-order",
  authMiddleware.verifyAccessToken,
  paymentController.createOrder.bind(paymentController)
);
router.post(
  "/verify",
  authMiddleware.verifyAccessToken,
  paymentController.verifyPayment.bind(paymentController)
);
router.get(
  "/",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  paymentController.getAllPayments.bind(paymentController)
);
router.get(
  "/date-range",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  paymentController.getPaymentsByDateRange.bind(paymentController)
);
router.get(
  "/payment-history",
  authMiddleware.verifyAccessToken,
  // authorizeRoles(["student"]),
  paymentController.getUserPaymentHistory.bind(paymentController)
);

export default router;
