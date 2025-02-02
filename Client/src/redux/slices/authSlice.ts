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

const getLocalStorage = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

const setLocalStorage = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};

const removeLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};

const getStoredUser = (): User | null => {
  const userData = getLocalStorage("user");
  return userData ? JSON.parse(userData) : null;
};

const initialState: AuthState = {
  user: getStoredUser(),
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
      removeLocalStorage("user");
      removeLocalStorage("token");
      removeLocalStorage("refreshToken");
    },
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.token = accessToken;
      state.refreshToken = refreshToken;
      setLocalStorage("user", JSON.stringify(user));
      setLocalStorage("token", accessToken);
      setLocalStorage("refreshToken", refreshToken);
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          const { accessToken, refreshToken, user } = payload.data;
          state.user = user;
          state.token = accessToken;
          state.refreshToken = refreshToken;
          setLocalStorage("user", JSON.stringify(user));
          setLocalStorage("token", accessToken);
          setLocalStorage("refreshToken", refreshToken);
        }
      )
      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, { payload }) => {
          const { accessToken, refreshToken, user } = payload.data;
          state.user = user;
          state.token = accessToken;
          state.refreshToken = refreshToken;
          setLocalStorage("user", JSON.stringify(user));
          setLocalStorage("token", accessToken);
          setLocalStorage("refreshToken", refreshToken);
        }
      )
      .addMatcher(
        authApi.endpoints.verifyOtp.matchFulfilled,
        (state, { payload }) => {
          const { accessToken, refreshToken, user } = payload.data;
          state.user = user;
          state.token = accessToken;
          state.refreshToken = refreshToken;
          setLocalStorage("user", JSON.stringify(user));
          setLocalStorage("token", accessToken);
          setLocalStorage("refreshToken", refreshToken);
        }
      )
      .addMatcher(
        authApi.endpoints.googleAuth.matchFulfilled,
        (state, { payload }) => {
          const { accessToken, refreshToken, user } = payload.data;
          state.user = user;
          state.token = accessToken;
          state.refreshToken = refreshToken;
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
        }
      )
      .addMatcher(
        authApi.endpoints.updateProfile.matchFulfilled,
        (state, { payload }) => {
          console.log("Update:", payload);
          state.user = payload.data;
          setLocalStorage("user", JSON.stringify(payload.data));
        }
      )
      .addMatcher(
        authApi.endpoints.refreshAccessToken.matchFulfilled,
        (state, { payload }) => {
          state.token = payload.data.accessToken;
          state.refreshToken = payload.data.refreshToken;
          setLocalStorage("token", payload.data.accessToken);
          setLocalStorage("refreshToken", payload.data.refreshToken);
        }
      );
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
