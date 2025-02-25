import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
// import { logout, setCredentials } from "../slices/authSlice";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3003";

interface RefreshTokenResponse {
  data: {
    data: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

const baseQuery = fetchBaseQuery({
  baseUrl: `${BASE_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});

const baseQueryWithReauth = async (
  args: Parameters<typeof baseQuery>[0],
  api: Parameters<typeof baseQuery>[1],
  extraOptions: Parameters<typeof baseQuery>[2]
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.log("Access token expired, attempting to refresh...");

    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    if (!refreshToken) {
      console.log("No refresh token, logging out...");
      api.dispatch({ type: "/auth/logout" });
      return result;
    }

    const refreshResult = (await baseQuery(
      {
        url: "/auth/refresh-token",
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions
    )) as RefreshTokenResponse;
    console.log("Refresh result:", refreshResult);

    if (refreshResult.data) {
      console.log("Token refreshed successfully.", refreshResult.data);
      const user = (api.getState() as RootState).auth.user;
      if (user) {
        await api.dispatch({
          type: "/auth/refresh-token",
          payload: {
            accessToken: refreshResult.data.data.accessToken,
            refreshToken: refreshResult.data.data.refreshToken,
          },
        });
        // await api.dispatch(
        //   setCredentials({
        //     user,
        //     accessToken: refreshResult.data.data.accessToken,
        //     refreshToken: refreshResult.data.data.refreshToken,
        //   })
        // );

        const requestArgs =
          typeof args === "string"
            ? {
                url: args,
                headers: {
                  authorization: `Bearer ${refreshResult.data.data.accessToken}`,
                },
              }
            : {
                ...args,
                headers: {
                  ...args.headers,
                  authorization: `Bearer ${refreshResult.data.data.accessToken}`,
                },
              };

        result = await baseQuery(requestArgs, api, extraOptions);
      } else {
        console.log("User not found, logging out...");
        api.dispatch({ type: "/auth/logout" });
      }
    } else {
      console.log("Refresh token invalid, logging out...");
      api.dispatch({ type: "/auth/logout" });
    }
  }

  return result;
};

const apiInstance = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Categories",
    "Courses",
    "InstructorCourses",
    "Cart",
    "Wishlist",
    "EnrolledCourses",
    "Details",
    "CourseProgress",
  ],
  endpoints: () => ({}),
});

export const api = apiInstance;
