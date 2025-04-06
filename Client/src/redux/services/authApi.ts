import { User } from "../slices/authSlice";
import { api } from "./apiSetup";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<
      { message: string },
      { name: string; email: string; password: string }
    >({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),

    sendOTP: builder.mutation<
      { message: string },
      { email: string | undefined }
    >({
      query: (body) => ({
        url: "/auth/send-otp",
        method: "POST",
        body,
      }),
    }),

    verifyOtp: builder.mutation<
      { token: string },
      { email: string; otp: string }
    >({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),

    login: builder.mutation<
      {
        // token: string;
        // user: {
        //   id: string;
        //   name: string;
        //   email: string;
        //   role: "student" | "instructor" | "admin";
        //   photoUrl: string;
        // };
        success: boolean;
        message: string;
        data: {
          accessToken: string;
          refreshToken: string;
          user: User;
          requiresVerification: boolean;
        };
      },
      { email: string; password: string }
    >({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),

    logout: builder.mutation<{ message: string }, { userId: string }>({
      query: (body) => ({
        url: "/auth/logout",
        method: "POST",
        body,
      }),
    }),

    forgotPassword: builder.mutation<
      { message: string },
      { email: string | undefined; otp: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<
      { message: string },
      { curPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    googleAuth: builder.mutation<
      {
        data: {
          user: {
            id: string;
            name: string;
            email: string;
            role: "student" | "instructor" | "admin";
            photoUrl: string;
          };
          accessToken: string;
          refreshToken: string;
        };
      },
      { token: string }
    >({
      query: (body) => ({
        url: "/auth/google-auth",
        method: "POST",
        body,
      }),
    }),
    getPresignedUrl: builder.mutation<
      { url: string; key: string },
      { fileName: string }
    >({
      query: (body) => ({
        url: "/user/upload-url",
        method: "POST",
        body,
      }),
    }),
    updateProfile: builder.mutation<
      {
        message: string;
        data: {
          id: string;
          name: string;
          email: string;
          role: "student" | "instructor" | "admin";
          photoUrl: string;
        };
      },
      { name: string; email: string; password?: string; photoUrl?: string }
    >({
      query: (body) => ({
        url: "/user/update-profile",
        method: "PUT",
        body,
      }),
    }),
    refreshAccessToken: builder.mutation<
      { data: { accessToken: string; refreshToken: string } },
      { refreshToken: string }
    >({
      query: (body) => ({
        url: "/auth/refresh-token",
        method: "POST",
        body,
      }),
    }),
    getUserStatus: builder.query({
      query: () => `/user/status`,
    }),
  }),
});

export const {
  useRegisterMutation,
  useSendOTPMutation,
  useVerifyOtpMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGoogleAuthMutation,
  useUpdateProfileMutation,
  useGetPresignedUrlMutation,
  useRefreshAccessTokenMutation,
  useGetUserStatusQuery,
} = authApi;
