import express from "express";
import NotificationController from "../Controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.get(
  "/",
  authMiddleware.verifyAccessToken,
  NotificationController.getNotifications
);
router.put(
  "/:notificationId/read",
  authMiddleware.verifyAccessToken,
  NotificationController.markAsRead
);

export default router;
