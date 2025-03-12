import { api } from "./apiSetup";

export const ratingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all reviews for a course
    getReviewsByCourseId: builder.query({
      query: ({ courseId, limit, offset }) => ({
        url: `/reviews/${courseId}`,
        params: { limit, offset },
      }),
      providesTags: (result, error, { courseId }) => [
        { type: "Reviews", id: courseId },
      ],
    }),

    // Create a new review
    createReview: builder.mutation({
      query: ({ courseId, userId, userName, rating, comment }) => ({
        url: `/reviews`,
        method: "POST",
        body: { courseId, userId, userName, rating, comment },
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Reviews", id: courseId },
      ],
    }),

    // Update a review
    updateReview: builder.mutation({
      query: ({ reviewId, rating, comment }) => ({
        url: `/reviews/${reviewId}`,
        method: "PUT",
        body: { rating, comment },
      }),
      invalidatesTags: (result, error, { reviewId }) => [
        { type: "Reviews", id: reviewId },
      ],
    }),

    // Delete a review
    deleteReview: builder.mutation({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, reviewId) => [
        { type: "Reviews", id: reviewId },
      ],
    }),
  }),
});

export const {
  useGetReviewsByCourseIdQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = ratingsApi;
