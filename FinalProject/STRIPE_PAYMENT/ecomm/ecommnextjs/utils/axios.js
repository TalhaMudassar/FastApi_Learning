import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  withCredentials: true, // Automatically sends HTTP-Only session/JWT cookies
});

// Intercept responses to catch expired 401 tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If access token expired (401) and we haven't already retried this request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/account/refresh") &&
      !originalRequest.url?.includes("/api/account/login")
    ) {
      originalRequest._retry = true;

      try {
        // Exchange refresh token cookie for a new access token cookie
        await api.post("/api/account/refresh");

        // Retry the original request that failed
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is also expired or invalid; let the app handle logout
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;