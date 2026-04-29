import axios from "axios";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

const api = axios.create({
  baseURL: "",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    const cleanToken = token.replace(/"/g, "");
    // ❌ НЕ добавляем Bearer, бэкенд ждет чистый токен
    config.headers.Authorization = cleanToken;
  }
  return config;
});

const UNAUTHORIZED = 401;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage
          .getItem(REFRESH_TOKEN_KEY)
          ?.replace(/"/g, "");

        // Используем правильный эндпоинт для рефреша
        const { data } = await axios.post("/api/auth/refresh", { refreshToken });

        localStorage.setItem(TOKEN_KEY, JSON.stringify(data.token));
        if (data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, JSON.stringify(data.refreshToken));
        }

        originalRequest.headers.Authorization = data.token;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;