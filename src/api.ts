import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

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
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    const cleanToken = token.replace(/^"|"$/g, "");
    config.headers.Authorization = `${cleanToken}`;
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

    try {
      const refreshToken = localStorage
        .getItem(REFRESH_TOKEN_KEY)
        ?.replace(/^"|"$/g, "");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || ""}/api/auth/refresh`,
        { refreshToken },
        { validateStatus: () => true }
      );

      if (response.status === 200 && response.data) {
        const { token, refreshToken: newRefreshToken } = response.data;

        if (token) {
          localStorage.setItem(TOKEN_KEY, token);

          if (newRefreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          }

          originalRequest.headers.Authorization = `${token}`;
          return api(originalRequest);
        }
      }

      throw new Error("Failed to refresh token");
    } catch (refreshError) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);

      const currentPath = window.location.pathname;
      if (currentPath !== "/auth/login") {
        localStorage.setItem("redirectAfterLogin", currentPath);
      }

      window.location.href = "/auth/login";
      return Promise.reject(refreshError);
    }
  }
);

export default api;

export const checkAuthStatus = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      return !!refreshToken;
    }

    return true;
  } catch {
    return false;
  }
};
