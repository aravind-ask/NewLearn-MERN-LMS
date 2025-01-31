import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  photoUrl: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
};

const getLocalStorage = (key: string) => {
  return typeof window !== "undefined" ? localStorage.getItem(key) : null;
};

const initialState: AuthState = {
  user: null,
  token: getLocalStorage("token"),
  refreshToken: getLocalStorage("refreshToken"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.user;
          state.token = payload.accessToken;
          state.refreshToken = payload.refreshToken;
          if (typeof window !== "undefined") {
            localStorage.setItem("token", payload.accessToken);
            localStorage.setItem("refreshToken", payload.refreshToken);
          }
        }
      )
      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.user;
          state.token = payload.accessToken;
          state.refreshToken = payload.refreshToken;
          if (typeof window !== "undefined") {
            localStorage.setItem("token", payload.accessToken);
            localStorage.setItem("refreshToken", payload.refreshToken);
          }
        }
      )
      .addMatcher(
        authApi.endpoints.verifyOtp.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.user;
          state.token = payload.accessToken;
          state.refreshToken = payload.refreshToken;
          if (typeof window !== "undefined") {
            localStorage.setItem("token", payload.accessToken);
            localStorage.setItem("refreshToken", payload.refreshToken);
          }
        }
      );
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
