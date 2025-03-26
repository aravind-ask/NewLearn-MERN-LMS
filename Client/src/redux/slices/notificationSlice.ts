import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Notification {
  _id: string;
  userId: string;
  type: "new_course" | "message" | "assignment" | "other";
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload);
    },
    markNotificationAsRead(state, action: PayloadAction<string>) {
      const notification = state.notifications.find(
        (n) => n._id === action.payload
      );
      if (notification) notification.isRead = true;
    },
  },
});

export const { setNotifications, addNotification, markNotificationAsRead } =
  notificationSlice.actions;
export default notificationSlice.reducer;
