import { Request, Response } from "express";
import NotificationService from "../services/notification.service";
import { successResponse, errorResponse } from "../utils/responseHandler";
import { UnauthorizedError } from "../utils/customError";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export class NotificationController {
  async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Unauthorized");
      }
      const userId = req.user.id;
      const notifications = await NotificationService.getUserNotifications(
        userId
      );
      successResponse(res, notifications, "Notifications fetched successfully");
    } catch (error) {
      errorResponse(res, error);
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const notification = await NotificationService.markNotificationAsRead(
        notificationId
      );
      successResponse(res, notification, "Notification marked as read");
    } catch (error) {
      errorResponse(res, error);
    }
  }
}

export default new NotificationController();
