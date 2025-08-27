import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery"; // Import from baseQuery.ts

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ME"],
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
} = api;
