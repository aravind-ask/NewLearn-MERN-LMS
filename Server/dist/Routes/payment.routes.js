"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/Routes/paymentRoutes.ts
const express_1 = __importDefault(require("express"));
const payment_repository_1 = require("../repositories/payment.repository");
const enrollment_repository_1 = require("../repositories/enrollment.repository");
const course_repository_1 = require("../repositories/course.repository");
const course_service_1 = require("../services/course.service");
const payment_service_1 = require("../services/payment.service");
const payment_controller_1 = require("../Controllers/payment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const authorizeRoles_1 = require("../middlewares/authorizeRoles");
const offer_service_1 = require("../services/offer.service");
const offer_repository_1 = require("../repositories/offer.repository");
const paymentRepository = new payment_repository_1.PaymentRepository();
const enrollmentRepository = new enrollment_repository_1.EnrollmentRepository();
const courseRepository = new course_repository_1.CourseRepository();
const offerService = new offer_service_1.OfferService(new offer_repository_1.OfferRepository());
const courseService = new course_service_1.CourseService(new course_repository_1.CourseRepository(), offerService);
const paymentService = new payment_service_1.PaymentService(paymentRepository, enrollmentRepository, courseService);
const paymentController = new payment_controller_1.PaymentController(paymentService);
const router = express_1.default.Router();
// Routes
router.post("/create-order", auth_middleware_1.authMiddleware.verifyAccessToken, paymentController.createOrder.bind(paymentController));
router.post("/verify", auth_middleware_1.authMiddleware.verifyAccessToken, paymentController.verifyPayment.bind(paymentController));
router.get("/", auth_middleware_1.authMiddleware.verifyAccessToken, (0, authorizeRoles_1.authorizeRoles)(["admin"]), paymentController.getAllPayments.bind(paymentController));
router.get("/date-range", auth_middleware_1.authMiddleware.verifyAccessToken, (0, authorizeRoles_1.authorizeRoles)(["admin"]), paymentController.getPaymentsByDateRange.bind(paymentController));
router.get("/payment-history", auth_middleware_1.authMiddleware.verifyAccessToken, 
// authorizeRoles(["student"]),
paymentController.getUserPaymentHistory.bind(paymentController));
exports.default = router;
