import axios from "axios";
import { store } from "../redux/store";
import { setCredentials, logout } from "../redux/slices/authSlice";

const apiClient = axios.create({
  baseURL: "http://localhost:3003/api",
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = store.getState().auth.refreshToken;
        if (!refreshToken) {
          store.dispatch(logout());
          return Promise.reject(error);
        }

        const { data } = await axios.post(
          "http://localhost:3003/api/auth/refresh-token",
          { refreshToken }
        );

        store.dispatch(
          setCredentials({
            user: data.user,
            token: data.accessToken,
            refreshToken: data.refreshToken,
          })
        );
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return axios(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
