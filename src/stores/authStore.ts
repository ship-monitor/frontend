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
      // TODO(auth): Clear stale user state on Err and return an explicit authentication result so callers can verify login before navigating.
      (await getCurrentUser())
        .map((u) => {
          this.user = u;
        })
        .inspectErr((err) => console.error("failed fetch user: %s", err));
    },

    async logout() {
      // TODO(auth): Match the logout Result and define retry/forced-local-logout behavior instead of ignoring server-side logout failures.
      await apiLogout();
      this.user = null;
    },
  },
});
