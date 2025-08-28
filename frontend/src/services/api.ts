import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery"; // Import from baseQuery.ts
import {
  NotificationResponse,
  CreateNotificationData,
  NotificationStats,
} from "../types/notification";

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ME", "Notifications", "Users", "Appointments"],
  endpoints: (builder) => ({
    // Service endpoints
    getServices: builder.query<any, void>({
      query: () => "/services",
    }),
    createService: builder.mutation<
      any,
      { name: string; description: string; duration: number; price: number }
    >({
      query: (body) => ({
        url: "/services",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),
    updateService: builder.mutation<
      any,
      {
        id: string;
        name: string;
        description: string;
        duration: number;
        price: number;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/services/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Users"],
    }),
    deleteService: builder.mutation<any, string>({
      query: (id) => ({
        url: `/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    // Staff endpoints
    getStaff: builder.query<any, void>({
      query: () => "/staff",
    }),

    // Availability endpoint
    getAvailability: builder.query<
      any,
      { staffId: string; serviceId: string; date: string }
    >({
      query: (body) => ({
        url: "/appointments/availability",
        method: "POST",
        body,
      }),
    }),

    // Create appointment
    createAppointment: builder.mutation<
      any,
      { staffId: string; serviceId: string; startTime: Date }
    >({
      query: (body) => ({
        url: "/appointments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Appointments"],
    }),
    manualRefreshToken: builder.mutation<{ token: string }, void>({
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
      { users: { _id: string; name: string; email: string; role?: string }[] },
      void
    >({
      query: () => "/users",
      providesTags: ["Users"],
    }),

    updateUserRole: builder.mutation<any, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["Users"],
    }),

    deleteUser: builder.mutation<any, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
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

    // Appointment endpoints
    getUserAppointments: builder.query<any, void>({
      query: () => "/appointments/me",
      providesTags: ["Appointments"],
    }),

    cancelAppointment: builder.mutation<any, string>({
      query: (id) => ({
        url: `/appointments/${id}/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["Appointments"],
    }),
    rescheduleAppointment: builder.mutation<
      any,
      { id: string; newStartTime: Date }
    >({
      query: ({ id, newStartTime }) => ({
        url: `/appointments/${id}/reschedule`,
        method: "",
        body: { newStartTime },
      }),
      invalidatesTags: ["Appointments"],
    }),
    getAllAppointments: builder.query<any, void>({
      query: () => "/appointments/all",
      providesTags: ["Appointments"],
    }),

    // Notification endpoints
    getUserNotifications: builder.query<NotificationResponse, void>({
      query: () => "/notifications/user",
      providesTags: ["Notifications"],
    }),

    getUnreadCount: builder.query<
      { success: boolean; unreadCount: number },
      void
    >({
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
    getBusySlotsForStaff: builder.query<
      { busySlots: string[] },
      { staffId: string; date: string }
    >({
      query: ({ staffId, date }) => ({
        url: `/staff/${staffId}/busy-slots?date=${date}`, // Append query PARAM manually
        method: "GET",
      }),
    }),

    markAllAsRead: builder.mutation<NotificationResponse, void>({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // Admin notification endpoints
    createNotification: builder.mutation<
      NotificationResponse,
      CreateNotificationData
    >({
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

    getNotificationStats: builder.query<
      { success: boolean; stats: NotificationStats },
      void
    >({
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
  /* These are hooks generated by Redux Toolkit Query for handling user authentication and related
actions in the application: */
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useManualRefreshTokenMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,

  // Notification hooks
  /* These hooks are part of the API created using Redux Toolkit Query for managing notifications in an
  application: */
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
  /* `useGetAllUsersQuery` is a hook that allows you to fetch all users from the server. It sends a
 request to the `/users` endpoint to retrieve a list of users. */
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,

  // Service & Staff
  /* These hooks are part of the API created using Redux Toolkit Query for managing services and staff
  in an application: */
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetStaffQuery,

  /* The `useGetBusySlotsForStaffQuery` hook is used to fetch the busy slots for a specific staff
  member on a particular date. It sends a request to the server to retrieve the busy slots
  information for the specified staff member and date. This information can be useful for managing
  staff schedules and appointments effectively. */
  useGetBusySlotsForStaffQuery,

  // Availability & Appointment
  /* These hooks are part of the API created using Redux Toolkit Query. Here's a brief explanation of
 each: */
  useGetAvailabilityQuery,
  useCreateAppointmentMutation,
  useGetUserAppointmentsQuery,
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation,
  useGetAllAppointmentsQuery,
} = api;
