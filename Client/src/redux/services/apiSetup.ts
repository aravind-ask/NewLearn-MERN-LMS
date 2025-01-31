import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from '../store';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3003"; 

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: () => ({}),
});
