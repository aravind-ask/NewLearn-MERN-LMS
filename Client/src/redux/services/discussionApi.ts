// redux/services/discussionApi.ts
import { api } from "./apiSetup";

export const discussionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDiscussionsByLecture: builder.query({
      // Changed from getDiscussionsByCourse
      query: (lectureId) => ({
        url: `/discussion/lecture/${lectureId}`,
        method: "GET",
      }),
      providesTags: ["Discussion"],
    }),
    createDiscussion: builder.mutation({
      query: (discussionData) => ({
        url: "/discussion/create",
        method: "POST",
        body: discussionData,
      }),
      invalidatesTags: ["Discussion"],
    }),
    getDiscussionById: builder.query({
      query: (discussionId) => ({
        url: `/discussion/${discussionId}`,
        method: "GET",
      }),
      providesTags: ["Discussion"],
    }),
    createComment: builder.mutation({
      query: (commentData) => ({
        url: "/discussion/comment",
        method: "POST",
        body: commentData,
      }),
      invalidatesTags: ["Discussion"],
    }),
  }),
});

export const {
  useGetDiscussionsByLectureQuery,
  useCreateDiscussionMutation,
  useGetDiscussionByIdQuery,
  useCreateCommentMutation,
} = discussionApi;
