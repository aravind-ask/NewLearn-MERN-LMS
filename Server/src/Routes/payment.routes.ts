// src/routes/paymentRoutes.ts
import express from "express";
import {
  createOrder,
  getAllPayments,
  getPaymentsByDateRange,
  verifyPayment,
} from "../Controllers/payment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = express.Router();

router.post("/create-order", authMiddleware.verifyAccessToken, createOrder);
router.post("/verify", authMiddleware.verifyAccessToken, verifyPayment);
router.get(
  "/",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  getAllPayments
);
router.get(
  "/date-range",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  getPaymentsByDateRange
);

export default router;
