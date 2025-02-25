import { api } from "./apiSetup";

export const courseProgressApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Mark a lecture as viewed
    markLectureAsViewed: builder.mutation({
      query: ({ courseId, lectureId }) => ({
        url: "/progress/mark-lecture-viewed",
        method: "POST",
        body: { courseId, lectureId },
      }),
      invalidatesTags: ["CourseProgress"],
    }),

    // Get current course progress
    getCourseProgress: builder.query({
      query: ({ courseId }) => ({
        url: `/progress/progress/${courseId}`,
      }),
      providesTags: ["CourseProgress"],
    }),

    // Reset course progress
    resetCourseProgress: builder.mutation({
      query: ({ courseId }) => ({
        url: "/progress/reset-progress",
        method: "POST",
        body: { courseId },
      }),
      invalidatesTags: ["CourseProgress"],
    }),
  }),
});

export const {
  useMarkLectureAsViewedMutation,
  useGetCourseProgressQuery,
  useResetCourseProgressMutation,
} = courseProgressApi;
