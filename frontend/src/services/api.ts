import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery"; // Import from baseQuery.ts
import { NotificationResponse, CreateNotificationData, NotificationStats } from "../types/notification";

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ME", "Notifications", "Users"],
  endpoints: (builder) => ({
    manualRefreshToken: builder.mutation<
      { token: string },
      void
    >({
      query: () => ({
        url: "/users/refresh-token",
        method: "POST",
        // No body needed since refresh token is in httpOnly cookie
      }),
    }),
    register: builder.mutation<
      { success: boolean; message: string; userId: string },
      { name: string; email: string; password: string; phone?: string }
    >({
      query: (body) => ({
        url: "/users/register",
        method: "POST",
        body,
      }),
    }),
    getAllUsers: builder.query<
    { users: { _id: string; name: string; email: string }[] }, 
    void
  >({
    query: () => "/users", // Ensure your backend GET /users returns list of users with _id, name, email
    providesTags: ["Users"],
  }),

    login: builder.mutation<
      { token: string; refreshToken: string; user: any },
      { email: string; password: string }
    >({
      query: (body) => ({
        url: "/users/login",
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/users/logout",
        method: "POST",
        // No body needed since refresh token is in httpOnly cookie
      }),
    }),
    me: builder.query<any, void>({
      query: () => "/users/me",
      providesTags: ["ME"],
    }),
    
    sendOtp: builder.mutation<
      { success: boolean; message: string },
      { email: string }
    >({
      query: (body) => ({
        url: "/otp/send-otp",
        method: "POST",
        body,
      }),
    }),
    verifyOtp: builder.mutation<
      { success: boolean; message: string },
      { email: string; otp: string }
    >({
      query: (body) => ({
        url: "/otp/verify-otp",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<
      { success: boolean; message: string },
      { email: string; password: string }
    >({
      query: (body) => ({
        url: "/users/reset-password",
        method: "POST",
        body,
      }),
      
    }),

    // Notification endpoints
    getUserNotifications: builder.query<NotificationResponse, void>({
      query: () => "/notifications/user",
      providesTags: ["Notifications"],
    }),

    getUnreadCount: builder.query<{ success: boolean; unreadCount: number }, void>({
      query: () => "/notifications/unread-count",
      providesTags: ["Notifications"],
    }),

    markAsRead: builder.mutation<NotificationResponse, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),

    markAllAsRead: builder.mutation<NotificationResponse, void>({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // Admin notification endpoints
    createNotification: builder.mutation<NotificationResponse, CreateNotificationData>({
      query: (body) => ({
        url: "/notifications",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications"],
    }),

    getAllNotifications: builder.query<NotificationResponse, void>({
      query: () => "/notifications/all",
      providesTags: ["Notifications"],
    }),

    deleteNotification: builder.mutation<NotificationResponse, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),

    getNotificationStats: builder.query<{ success: boolean; stats: NotificationStats }, void>({
      query: () => "/notifications/stats",
      providesTags: ["Notifications"],
    }),
    
    getNotificationReadStatus: builder.query<any, string>({
      query: (notificationId) => `/notifications/${notificationId}/read-status`,
      providesTags: ["Notifications"],
    }),
    
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useManualRefreshTokenMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  
  // Notification hooks
  useGetUserNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useCreateNotificationMutation,
  useGetAllNotificationsQuery,
  useDeleteNotificationMutation,
  useGetNotificationStatsQuery,
  useGetNotificationReadStatusQuery,

  //all user 
  useGetAllUsersQuery 
} = api;
