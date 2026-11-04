import axios from "axios";
import { ROUTES } from "@/constants/routes";
import { getAppRouter } from "@/router";
import { getAuthToken } from "@/utils/authToken";

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
  });
};

const api = createApi();

// Авторизация в API v2 — Bearer-токен из логина, cookies больше не используются.
// На /auth/* заголовок не ставим: refresh не должен зависеть от протухшего
// access-токена (глобальная security-схема парсит любой присланный Bearer).
api.interceptors.request.use((config) => {
  const isAuthRequest = (config.url ?? "").includes("/auth/");
  const token = getAuthToken();
  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const UNAUTHORIZED = 401;

// Публичные маршруты, с которых не нужно принудительно уводить на логин.
const PUBLIC_PATHS: string[] = [ROUTES.LOGIN];

// Один общий refresh на все параллельные 401: повторные запросы ждут его.
let refreshing: Promise<boolean> | null = null;

const tryRefreshSession = (): Promise<boolean> => {
  if (!refreshing) {
    refreshing = import("@/data/auth")
      .then(({ refreshSession }) => refreshSession())
      .then((result) => result.isOk)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }

  return refreshing;
};

const invalidateAndRedirect = () => {
  void import("@/stores/authStore").then(({ useAuthStore }) => {
    useAuthStore().invalidateSession();

    const router = getAppRouter();
    const currentPath = router?.currentRoute.value.path;

    if (router && currentPath && !PUBLIC_PATHS.includes(currentPath)) {
      router.push({
        path: ROUTES.LOGIN,
        query: { redirect: router.currentRoute.value.fullPath },
      });
    }
  });
};

// С validateStatus: () => true axios не отклоняет ответы по статусу,
// поэтому 401 обрабатываем здесь, в success-перехватчике.
api.interceptors.response.use(
  (response) => {
    if (response.status !== UNAUTHORIZED) {
      return response;
    }

    const isAuthRequest = (response.config.url ?? "").includes("/auth/");
    const alreadyRetried = (response.config as { retried?: boolean }).retried;

    if (isAuthRequest || alreadyRetried) {
      invalidateAndRedirect();
      return response;
    }

    return tryRefreshSession().then((refreshed) => {
      if (!refreshed) return response;

      const config = response.config as typeof response.config & {
        retried?: boolean;
      };
      config.retried = true;
      return api.request(config);
    });
  },
  // Сетевые ошибки/таймауты просто пробрасываем дальше без навигации.
  (error) => Promise.reject(error)
);

export default api;
