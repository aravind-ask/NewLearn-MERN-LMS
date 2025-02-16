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
      invalidatesTags: ["Courses"],
    }),
    updateCourse: builder.mutation({
      query: (courseEditData) => ({
        url: `/courses`,
        method: "PUT",
        body: courseEditData,
      }),
      invalidatesTags: ["Courses"],
    }),
    deleteCourse: builder.mutation({
      query: (courseId) => ({
        url: `/courses/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Courses"],
    }),
    getCourseDetails: builder.query({
      query: (courseId) => ({
        url: `/courses/${courseId}`,
      }),
    }),
  }),
});

export const {
  useCreateCourseMutation,
  useGetCoursesQuery,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetCourseDetailsQuery,
} = courseApi;
