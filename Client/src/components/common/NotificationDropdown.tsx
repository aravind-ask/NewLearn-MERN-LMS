import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
} from "@/redux/services/notificationApi";
import {
  setNotifications,
  markNotificationAsRead,
} from "@/redux/slices/notificationSlice";
import { motion, AnimatePresence } from "framer-motion";

const notificationSound = new Audio("/notification-01.mp3"); 

export default function NotificationDropdown() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { notifications } = useSelector(
    (state: RootState) => state.notifications
  );
  const dispatch = useDispatch();
  const { data, refetch } = useGetNotificationsQuery();
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [isOpen, setIsOpen] = useState(false);
  const prevNotificationsCount = useRef(notifications.length);

  // Load initial notifications and detect new ones for sound
  useEffect(() => {
    if (data?.data) {
      const newNotifications = data.data;
      if (
        newNotifications.length > prevNotificationsCount.current &&
        prevNotificationsCount.current > 0
      ) {
        notificationSound
          .play()
          .catch((error) => console.error("Audio playback failed:", error));
      }
      dispatch(setNotifications(newNotifications));
      prevNotificationsCount.current = newNotifications.length;
    }
  }, [data, dispatch]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId).unwrap();
      dispatch(markNotificationAsRead(notificationId));
      refetch();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter((n) => !n.isRead)
        .map((n) => n._id);
      await Promise.all(unreadIds.map((id) => markAsRead(id).unwrap()));
      unreadIds.forEach((id) => dispatch(markNotificationAsRead(id)));
      refetch();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
      " · " +
      date.toLocaleDateString()
    );
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="relative text-gray-700 hover:text-gray-900 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-9 w-9" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 z-50"
          >
            <Card className="shadow-xl border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-gray-200"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark All as Read
                  </Button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar bg-white">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-center p-4">
                    No notifications yet
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        notification.isRead ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimestamp(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleMarkAsRead(notification._id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

