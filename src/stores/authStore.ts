import { defineStore } from "pinia";
import type { User } from "@/models/models";
import { getCurrentUser, logout as apiLogout } from "@/data";

export const useAuthStore = defineStore("auth-store", {
  state: () => ({
    user: null as User | null,
    initialized: false,
    ready: null as Promise<void> | null,
  }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
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
