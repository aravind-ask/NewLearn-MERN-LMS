import Notification, { INotification } from "../models/Notification";

class NotificationService {
  async createNotification(
    userId: string,
    type: INotification["type"],
    title: string,
    message: string,
    relatedId?: string
  ): Promise<INotification> {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedId,
    });
    return await notification.save();
  }

  async getUserNotifications(userId: string): Promise<INotification[]> {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  }

  async markNotificationAsRead(notificationId: string): Promise<INotification> {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    if (!notification) throw new Error("Notification not found");
    return notification;
  }
}

export default new NotificationService();
