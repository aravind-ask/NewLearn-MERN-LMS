import { Interview, UserAnswer } from "@/types";
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
    getUserAnswer: builder.query<
      UserAnswer | null,
      { userId: string; question: string; mockIdRef: string }
    >({
      query: ({ userId, question, mockIdRef }) =>
        `interviews/user-answers?userId=${userId}&question=${encodeURIComponent(
          question
        )}&mockIdRef=${mockIdRef}`,
      providesTags: ["UserAnswer"],
    }),
    getUserAnswersByInterview: builder.query<
      UserAnswer[],
      { userId: string; mockIdRef: string }
    >({
      query: ({ userId, mockIdRef }) =>
        `interviews/user-answers?userId=${userId}&mockIdRef=${mockIdRef}`,
      providesTags: ["UserAnswer"],
    }),
    createUserAnswer: builder.mutation<UserAnswer, Partial<UserAnswer>>({
      query: (userAnswer) => ({
        url: "interviews/user-answers",
        method: "POST",
        body: userAnswer,
      }),
      invalidatesTags: ["UserAnswer"],
    }),
  }),
});

export const {
  useGetInterviewQuery,
  useCreateInterviewMutation,
  useGetInterviewsByUserQuery,
  useUpdateInterviewMutation,
  useGetUserAnswerQuery,
  useGetUserAnswersByInterviewQuery,
  useCreateUserAnswerMutation,
} = interviewApi;
