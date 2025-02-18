import { configureStore } from "@reduxjs/toolkit";
import { api } from "./services/apiSetup";
import authReducer from "./slices/authSlice";
import instructorReducer from "./slices/instructorSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    instructor: instructorReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
