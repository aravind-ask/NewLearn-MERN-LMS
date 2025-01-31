import apiClient from "../utils/apiClient";

export const userService = {
  async getProfile() {
    return apiClient.get("/users/profile");
  },

  async login(credentials: { email: string; password: string }) {
    return apiClient.post("/auth/login", credentials);
  },

  async register(data: { name: string; email: string; password: string }) {
    return apiClient.post("/auth/register", data);
  },
};
