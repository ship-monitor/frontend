import axios from "axios";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

const api = axios.create({
  baseURL: "", // Оставляем пустым, так как работает прокси в Vite
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    const cleanToken = token.replace(/"/g, "");
    config.headers.Authorization = cleanToken;
  }
  return config;
});

const UNAUTHORIZED = 401;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Проверяем, что ошибка 401 и мы ещё не пытались повторить этот запрос
    if (error.response?.status === UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage
          .getItem(REFRESH_TOKEN_KEY)
          ?.replace(/"/g, "");

        // Делаем запрос на обновление токена
        // Важно использовать axios, а не api, чтобы не зациклиться
        const { data } = await axios.post("/api/refresh", { refreshToken });

        // Сохраняем новые токены
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        }

        // Обновляем заголовок в упавшем запросе и повторяем его
        originalRequest.headers.Authorization = data.accessToken;
        return api(originalRequest);
      } catch (refreshError) {
        // Если рефреш тоже протух — разлогиниваем пользователя
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
export default api;
