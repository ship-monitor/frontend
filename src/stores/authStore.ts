import { defineStore } from "pinia";
import type { User } from "@/models/models";
import { getCurrentUser, logout as apiLogout } from "@/data";

export const useAuthStore = defineStore("auth-store", {
  state: () => ({
    user: null as User | null,
    initialized: false,
  }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
  },
  actions: {
    async initialize() {
      this.checkLogin();

      this.initialized = true;
    },

    async checkLogin() {
      (await getCurrentUser())
        .map((u) => {
          this.user = u;
        })
        .inspectErr((err) => console.error("failed fetch user: %s", err));
    },

    async logout() {
      await apiLogout();
      this.user = null;
    },
  },
});
