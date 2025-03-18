import { api } from "./apiSetup";

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConversation: builder.query({
      query: ({ courseId, trainerId }) => ({
        url: `/chat/${courseId}/${trainerId}`,
        method: "GET",
      }),
      providesTags: ["Chat"],
    }),
    sendMessage: builder.mutation({
      query: (messageData) => ({
        url: "/chat/send",
        method: "POST",
        body: messageData,
      }),
      invalidatesTags: ["Chat"],
    }),
    getAllInstructorConversations: builder.query({
      query: () => ({
        url: `/chat/all`,
        method: "GET",
      }),
      providesTags: ["Chat"],
    }),
  }),
});

export const {
  useGetConversationQuery,
  useSendMessageMutation,
  useGetAllInstructorConversationsQuery,
} = chatApi;
