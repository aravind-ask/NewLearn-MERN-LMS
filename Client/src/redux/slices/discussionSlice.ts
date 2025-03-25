// redux/slices/discussionSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface DiscussionState {
  discussions: Array<{
    _id: string;
    lectureId: string;
    userId: { _id: string; name: string };
    topic: string;
    createdAt: string;
    commentsCount: number;
    comments: Array<{
      _id: string;
      userId: { _id: string; name: string };
      content: string;
      createdAt: string;
    }>;
  }>;
  currentDiscussion: {
    _id: string;
    topic: string;
    userId: { _id: string; name: string };
    comments: Array<{
      _id: string;
      userId: { _id: string; name: string };
      content: string;
      createdAt: string;
    }>;
  } | null;
}

const initialState: DiscussionState = {
  discussions: [],
  currentDiscussion: null,
};

const discussionSlice = createSlice({
  name: "discussion",
  initialState,
  reducers: {
    setDiscussions: (state, action) => {
      state.discussions = action.payload
        .map((d) => ({
          ...d,
          comments: d.comments || [],
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ); // Newest first
    },
    addDiscussion: (state, action) => {
      state.discussions.unshift({ ...action.payload, comments: [] }); // Add to top
    },
    setCurrentDiscussion: (state, action) => {
      state.currentDiscussion = action.payload;
    },
    addComment: (state, action) => {
      const discussionIndex = state.discussions.findIndex(
        (d) => d._id === action.payload.discussionId
      );
      if (discussionIndex !== -1) {
        const updatedDiscussion = {
          ...state.discussions[discussionIndex],
          comments: [
            ...state.discussions[discussionIndex].comments,
            action.payload,
          ],
          commentsCount: state.discussions[discussionIndex].commentsCount + 1,
        };
        state.discussions = [
          ...state.discussions.slice(0, discussionIndex),
          updatedDiscussion,
          ...state.discussions.slice(discussionIndex + 1),
        ];
      }
      if (state.currentDiscussion?._id === action.payload.discussionId) {
        state.currentDiscussion = {
          ...state.currentDiscussion,
          comments: [...state.currentDiscussion.comments, action.payload],
        };
      }
    },
    editDiscussion: (state, action) => {
      const { _id, topic } = action.payload;
      const index = state.discussions.findIndex((d) => d._id === _id);
      if (index !== -1) {
        state.discussions[index] = { ...state.discussions[index], topic };
      }
      if (state.currentDiscussion?._id === _id)
        state.currentDiscussion.topic = topic;
    },
    deleteDiscussion: (state, action) => {
      const discussionId = action.payload;
      state.discussions = state.discussions.filter(
        (d) => d._id !== discussionId
      );
      if (state.currentDiscussion?._id === discussionId)
        state.currentDiscussion = null;
    },
    editComment: (state, action) => {
      const { _id, content, discussionId } = action.payload;
      const discussionIndex = state.discussions.findIndex(
        (d) => d._id === discussionId
      );
      if (discussionIndex !== -1) {
        const commentIndex = state.discussions[
          discussionIndex
        ].comments.findIndex((c) => c._id === _id);
        if (commentIndex !== -1) {
          const updatedComments = [
            ...state.discussions[discussionIndex].comments,
          ];
          updatedComments[commentIndex] = {
            ...updatedComments[commentIndex],
            content,
          };
          state.discussions[discussionIndex] = {
            ...state.discussions[discussionIndex],
            comments: updatedComments,
          };
        }
      }
      if (state.currentDiscussion?._id === discussionId) {
        const commentIndex = state.currentDiscussion.comments.findIndex(
          (c) => c._id === _id
        );
        if (commentIndex !== -1) {
          state.currentDiscussion.comments[commentIndex] = {
            ...state.currentDiscussion.comments[commentIndex],
            content,
          };
        }
      }
    },
    deleteComment: (state, action) => {
      const commentId = action.payload;
      state.discussions = state.discussions.map((discussion) => {
        const commentIndex = discussion.comments.findIndex(
          (c) => c._id === commentId
        );
        if (commentIndex !== -1) {
          return {
            ...discussion,
            comments: discussion.comments.filter((c) => c._id !== commentId),
            commentsCount: discussion.commentsCount - 1,
          };
        }
        return discussion;
      });
      if (state.currentDiscussion) {
        state.currentDiscussion.comments =
          state.currentDiscussion.comments.filter((c) => c._id !== commentId);
      }
    },
  },
});

export const {
  setDiscussions,
  addDiscussion,
  setCurrentDiscussion,
  addComment,
  editDiscussion,
  deleteDiscussion,
  editComment,
  deleteComment,
} = discussionSlice.actions;
export default discussionSlice.reducer;
