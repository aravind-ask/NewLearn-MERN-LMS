// redux/services/discussionApi.ts
import { api } from "./apiSetup";

export const discussionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDiscussionsByLecture: builder.query({
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
    editDiscussion: builder.mutation({
      query: ({ discussionId, topic }) => ({
        url: "/discussion/edit",
        method: "PUT",
        body: { discussionId, topic },
      }),
      invalidatesTags: ["Discussion"],
    }),
    deleteDiscussion: builder.mutation({
      query: (discussionId) => ({
        url: `/discussion/${discussionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Discussion"],
    }),
    editComment: builder.mutation({
      query: ({ commentId, content }) => ({
        url: "/discussion/comment/edit",
        method: "PUT",
        body: { commentId, content },
      }),
      invalidatesTags: ["Discussion"],
    }),
    deleteComment: builder.mutation({
      query: (commentId) => ({
        url: `/discussion/comment/${commentId}`,
        method: "DELETE",
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
  useEditDiscussionMutation,
  useDeleteDiscussionMutation,
  useEditCommentMutation,
  useDeleteCommentMutation,
} = discussionApi;
