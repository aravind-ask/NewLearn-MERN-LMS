import { api } from "./apiSetup";

export const courseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: ({
        page,
        limit,
        search,
        category,
        difficulty,
        sortBy,
        sortOrder,
      }) => ({
        url: "/courses",
        params: {
          page,
          limit,
          search,
          category,
          difficulty,
          sortBy,
          sortOrder,
        },
      }),
      providesTags: ["Courses"],
    }),
    createCourse: builder.mutation({
      query: (courseData) => ({
        url: "/courses",
        method: "POST",
        body: courseData,
      }),
    }),
    deleteCourse: builder.mutation({
      query: (courseId) => ({
        url: `/courses/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Courses"],
    }),
  }),
});

export const {
  useCreateCourseMutation,
  useGetCoursesQuery,
  useDeleteCourseMutation,
} = courseApi;
