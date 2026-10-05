import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  withCredentials: true, // allow cookies
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("refresh")
    ) {
      originalRequest._retry = true;
      try {
        await api.post("api/account/refresh");
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
