import { configureStore } from "@reduxjs/toolkit";
import { api } from "./services/apiSetup";
import authReducer from "./slices/authSlice";
import instructorReducer from "./slices/instructorSlice";
import chatReducer from "./slices/chatSlice";
import discussionReducer from "./slices/discussionSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    instructor: instructorReducer,
    chat: chatReducer,
    discussion: discussionReducer,
    notifications: notificationReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
