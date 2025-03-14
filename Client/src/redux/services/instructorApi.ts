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
    updateInstructorApplication: builder.mutation({
      query: ({ applicationId, data }) => ({
        url: `/instructor/re-apply/${applicationId}`,
        method: "PUT",
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
    getInstructorApplication: builder.query({
      query: () => ({
        url: `/instructor/application`,
        method: "GET",
      }),
    }),
    getInstructorApplicationDetails: builder.query({
      query: ({ applicationId }) => ({
        url: `/instructor/application/${applicationId}`,
        method: "GET",
      }),
    }),
    getInstructorCourses: builder.query({
      query: ({
        page,
        limit,
        sortBy = "createdAt",
        order = "desc",
        search = "",
      }) => ({
        url: `/instructor/courses?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}&search=${search}`,
        method: "GET",
        providesTags: ["Courses", "InstructorCourses"],
      }),
    }),
    getInstructorDetails: builder.query({
      query: (instructorId) => `/instructor/details/${instructorId}`,
    }),
  }),
});

export const {
  useApplyForInstructorMutation,
  useUpdateInstructorApplicationMutation,
  useGetInstructorApplicationsQuery,
  useGetInstructorApplicationQuery,
  useReviewInstructorApplicationMutation,
  useGetInstructorCoursesQuery,
  useGetInstructorApplicationDetailsQuery,
  useGetInstructorDetailsQuery,
} = instructorApi;
