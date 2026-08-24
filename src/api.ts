import axios from "axios";
import { ROUTES } from "@/constants/routes";
import { getAppRouter } from "@/router";

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

// Публичные маршруты, с которых не нужно принудительно уводить на логин.
const PUBLIC_PATHS: string[] = [ROUTES.LANDING, ROUTES.LOGIN, ROUTES.REGISTER];

// С validateStatus: () => true axios не отклоняет ответы по статусу,
// поэтому 401 обрабатываем здесь, в success-перехватчике.
api.interceptors.response.use(
  (response) => {
    if (response.status === UNAUTHORIZED) {
      void import("@/stores/authStore").then(({ useAuthStore }) => {
        useAuthStore().reset();
      });
      const router = getAppRouter();
      const currentPath = router?.currentRoute.value.path;

      if (router && currentPath && !PUBLIC_PATHS.includes(currentPath)) {
        router.push({
          path: ROUTES.LOGIN,
          query: { redirect: router.currentRoute.value.fullPath },
        });
      }
    }

    return response;
  },
  // Сетевые ошибки/таймауты просто пробрасываем дальше без навигации.
  (error) => Promise.reject(error)
);

export default api;
