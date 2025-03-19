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
      state.discussions = action.payload;
    },
    addDiscussion: (state, action) => {
      state.discussions.unshift(action.payload);
    },
    setCurrentDiscussion: (state, action) => {
      state.currentDiscussion = action.payload;
    },
    addComment: (state, action) => {
      if (state.currentDiscussion) {
        state.currentDiscussion.comments.push(action.payload);
      }
    },
    editDiscussion: (state, action) => {
      const { _id, topic } = action.payload;
      const index = state.discussions.findIndex((d) => d._id === _id);
      if (index !== -1) state.discussions[index].topic = topic;
      if (state.currentDiscussion?._id === _id)
        state.currentDiscussion!.topic = topic;
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
      const { _id, content } = action.payload;
      if (state.currentDiscussion) {
        const commentIndex = state.currentDiscussion.comments.findIndex(
          (c) => c._id === _id
        );
        if (commentIndex !== -1)
          state.currentDiscussion.comments[commentIndex].content = content;
      }
    },
    deleteComment: (state, action) => {
      const commentId = action.payload;
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
