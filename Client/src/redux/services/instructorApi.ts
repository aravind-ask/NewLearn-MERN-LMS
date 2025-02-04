import { api } from "./apiSetup";

export const instructorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    applyForInstructor: builder.mutation({
      query: (data) => ({
        url: "/instructor/apply",
        method: "POST",
        body: data,
      }),
    }),
    getInstructorApplications: builder.query({
      query: ({ page, limit }) => ({
        url: `/instructor/applications?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    reviewInstructorApplication: builder.mutation({
      query: ({ applicationId, status, rejectionReason }) => ({
        url: `/instructor/review/${applicationId}`,
        method: "PUT",
        body: { status, rejectionReason },
      }),
    }),
    getInstructorApplication : builder.query({
      query: ({ applicationId }) => ({
        url: `/instructor/${applicationId}`,
        method: "GET",
      }),
    })
  }),
});

export const {
  useApplyForInstructorMutation,
  useGetInstructorApplicationsQuery,
  useGetInstructorApplicationQuery,
  useReviewInstructorApplicationMutation,
} = instructorApi;
