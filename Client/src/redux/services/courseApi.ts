import { api } from "./apiSetup";

export const courseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createCourse: builder.mutation({
      query: (courseData) => ({
        url: "/courses",
        method: "POST",
        body: courseData,
      }),
    }),
  }),
});

export const { useCreateCourseMutation } = courseApi;
