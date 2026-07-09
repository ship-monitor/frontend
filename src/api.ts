import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getToken, handleRefresh } from "@/auth";

const createApi = () => {
  const backendUrl = import.meta.env.VITE_API_URL;

  if (!backendUrl) {
    console.error("VITE_API_URL is not defined in environment variables");
    throw new Error("API base URL is not configured");
  }
  return axios.create({
    baseURL: backendUrl,
    validateStatus: () => true,
    timeout: 10000,
  });
};

const api = createApi();

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

const UNAUTHORIZED = 401;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== UNAUTHORIZED || originalRequest?._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const success = await handleRefresh();
    if (!success) return Promise.reject("failed refresh token");

    return api.request(originalRequest);
  }
);

export default api;
