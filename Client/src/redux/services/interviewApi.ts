import { Interview } from "@/types";
import { api } from "./apiSetup";

export const interviewApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getInterview: builder.query<Interview, string>({
      query: (id) => `interviews/${id}`,
      providesTags: ["Interview"],
    }),
    getInterviewsByUser: builder.query<Interview[], string>({
      query: () => `interviews`,
      providesTags: ["Interview"],
    }),
    createInterview: builder.mutation<Interview, Partial<Interview>>({
      query: (interview) => ({
        url: "interviews",
        method: "POST",
        body: interview,
      }),
      invalidatesTags: ["Interview"],
    }),
    updateInterview: builder.mutation<Interview, Partial<Interview>>({
      query: ({ _id, ...interview }) => ({
        url: `interviews/${_id}`,
        method: "PATCH",
        body: interview,
      }),
      invalidatesTags: ["Interview"],
    }),
  }),
});

export const {
  useGetInterviewQuery,
  useCreateInterviewMutation,
  useGetInterviewsByUserQuery,
  useUpdateInterviewMutation,
} = interviewApi;
