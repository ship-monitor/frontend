import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useRouter } from "vue-router";
import { ROUTES } from "@/constants/routes";

const createApi = () => {
  const backendUrl = import.meta.env.VITE_API_URL;

  if (!backendUrl) {
    console.error("VITE_API_URL is not defined in environment variables");
    throw new Error("API base URL is not configured");
  }
  return axios.create({
    baseURL: backendUrl,
    validateStatus: () => true,
    timeout: 5000,
    withCredentials: true,
  });
};

const api = createApi();

const UNAUTHORIZED = 401;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== UNAUTHORIZED || originalRequest?._retry) {
      const router = useRouter();
      router.push(ROUTES.LOGIN);

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    return api.request(originalRequest);
  }
);

export default api;
