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
      this.user = null;
      (await getCurrentUser())
        .map((u) => {
          this.user = u;
        })
        .inspectErr((err) => console.error("failed fetch user: %s", err));
    },

    reset() {
      this.user = null;
      this.initialized = false;
      this.ready = null;
    },

    async logout() {
      const result = await apiLogout();
      if (result.isErr) {
        console.warn("server logout failed, clearing local session: %s", result.error);
      }
      this.reset();
    },
  },
});
