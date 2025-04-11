import { User } from "../slices/authSlice";
import { api } from "./apiSetup";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<
      { data: { users: User[]; totalPages: number } },
      { page: number; limit: number; search?: string }
    >({
      query: ({ page, limit, search }) => ({
        url: "/user/get-users",
        params: { page, limit, search },
      }),
    }),
    blockUser: builder.mutation<
      { message: string },
      { userId: string; isBlocked: boolean }
    >({
      query: ({ userId, isBlocked }) => ({
        url: "/user/block",
        method: "POST",
        body: { userId, isBlocked },
      }),
    }),
    getStudentCourses: builder.query<
      { courses: Course[]; totalPages: number },
      { page: number; limit: number }
    >({
      query: ({ page, limit }) => ({
        url: `/user/get-student-courses?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["EnrolledCourses"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useBlockUserMutation,
  useGetStudentCoursesQuery,
} = authApi;
