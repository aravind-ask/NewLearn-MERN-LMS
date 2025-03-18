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
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
  },
});

export const { addMessage, setMessages, setConnected } = chatSlice.actions;
export default chatSlice.reducer;
