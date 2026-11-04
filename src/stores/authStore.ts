import { defineStore } from "pinia";
import { logout as localLogout } from "@/data";
import { clearAuthTokens, getAuthToken } from "@/utils/authToken";

export const useAuthStore = defineStore("auth-store", {
  state: () => ({
    authenticated: false,
    initialized: false,
    ready: null as Promise<void> | null,
  }),
  getters: {
    isAuthenticated: (state) => state.authenticated,
  },
  actions: {
    async initialize() {
      if (!this.ready) {
        this.ready = this.checkLogin().then(() => {
          this.initialized = true;
        });
      }

      return this.ready;
    },

    // В API v2 нет эндпоинта текущего пользователя: валидность сессии
    // определяется наличием сохранённого Bearer-токена.
    async checkLogin() {
      this.authenticated = false;
      // Временный обход авторизации для локальной разработки (VITE_DISABLE_AUTH=true).
      // Только для DEV-сборок: в production проверка выполняется как обычно.
      if (import.meta.env.DEV && import.meta.env.VITE_DISABLE_AUTH) {
        this.authenticated = true;
        return;
      }
      this.authenticated = getAuthToken() !== null;
    },

    reset() {
      this.authenticated = false;
      this.initialized = false;
      this.ready = null;
    },

    // Сброс только сессии, без обнуления initialized/ready:
    // используется 401-интерсептором, повторная инициализация не нужна.
    invalidateSession() {
      this.authenticated = false;
      clearAuthTokens();
    },

    async logout() {
      await localLogout();
      this.reset();
    },
  },
});
