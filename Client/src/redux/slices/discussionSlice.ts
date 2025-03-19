// redux/slices/discussionSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface DiscussionState {
  discussions: Array<{
    _id: string;
    lectureId: string; // Changed from courseId
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
  },
});

export const {
  setDiscussions,
  addDiscussion,
  setCurrentDiscussion,
  addComment,
} = discussionSlice.actions;
export default discussionSlice.reducer;
