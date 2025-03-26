import { api } from "./apiSetup";

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<any, void>({
      query: () => "/notifications",
    }),
    markNotificationAsRead: builder.mutation<any, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PUT",
      }),
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkNotificationAsReadMutation } =
  notificationApi;
