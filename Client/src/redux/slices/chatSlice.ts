// chatSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface ChatState {
  messages: Array<{
    _id: string;
    courseId: string;
    senderId: string;
    recipientId: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    courseTitle?: string;
    senderName?: string;
    role?: "student" | "instructor";
  }>;
  isConnected: boolean;
}

const initialState: ChatState = {
  messages: [],
  isConnected: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const existingIndex = state.messages.findIndex(
        (msg) =>
          msg._id === action.payload._id ||
          (msg._id.startsWith("temp-") &&
            msg.message === action.payload.message)
      );
      if (existingIndex >= 0) {
        state.messages[existingIndex] = action.payload; 
      } else {
        state.messages.push(action.payload);
      }
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    removeMessage: (state, action) => {
      state.messages = state.messages.filter(
        (msg) => msg._id !== action.payload
      );
    },
  },
});

export const { addMessage, setMessages, setConnected, removeMessage } =
  chatSlice.actions;
export default chatSlice.reducer;
