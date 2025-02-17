import { configureStore } from "@reduxjs/toolkit";
import { api } from "./services/apiSetup";
import { authApi } from "./services/authApi";
import authReducer from "./slices/authSlice";
import instructorReducer from "./slices/instructorSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer,
    instructor: instructorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
