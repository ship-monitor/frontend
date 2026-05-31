// src/api.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  validateStatus: () => true,
  timeout: 10000,
});

// ============ Флаг для предотвращения множественных запросов на обновление ============
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// ============ Request interceptor ============
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    const cleanToken = token.replace(/^"|"$/g, "");
    // ✅ Добавляем префикс Bearer
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

// ============ Response interceptor ============
const UNAUTHORIZED = 401;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status !== UNAUTHORIZED ||
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }

    // Если уже пытались обновить — пропускаем
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Если прямо сейчас идёт обновление токена — ставим запрос в очередь
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage
        .getItem(REFRESH_TOKEN_KEY)
        ?.replace(/^"|$/g, "");

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

          // Обновляем заголовок у оригинального запроса
          originalRequest.headers.Authorization = `Bearer ${token}`;

          // Обрабатываем очередь — все ждущие запросы получат новый токен
          processQueue(null, token);

          return api(originalRequest);
        }
      }

      throw new Error("Failed to refresh token");
    } catch (refreshError) {
      processQueue(refreshError, null);

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);

      const currentPath = window.location.pathname;
      if (currentPath !== "/auth/login") {
        localStorage.setItem("redirectAfterLogin", currentPath);
      }

      window.location.href = "/auth/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
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