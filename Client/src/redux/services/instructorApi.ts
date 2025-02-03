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
        url: `/instructor/${applicationId}`,
        method: "PUT",
        body: { status, rejectionReason },
      }),
    }),
  }),
});

export const {
  useApplyForInstructorMutation,
  useGetInstructorApplicationsQuery,
  useReviewInstructorApplicationMutation,
} = instructorApi;
