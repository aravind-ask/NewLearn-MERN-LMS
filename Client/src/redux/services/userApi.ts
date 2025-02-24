import { api } from "./apiSetup";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<
      { users: User[]; totalPages: number },
      { page: number; limit: number }
    >({
      query: ({ page, limit }) => ({
        url: `/user/get-users?page=${page}&limit=${limit}`,
        method: "GET",
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
