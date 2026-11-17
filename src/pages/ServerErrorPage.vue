<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="ship-card p-8 sm:p-10 max-w-md w-full text-center animate-scale-in">
      <span
        class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 text-red-500 mb-4"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4.99a2 2 0 00-3.5 0L3.16 16.25A2 2 0 005 19z"
          />
        </svg>
      </span>
      <h1 class="text-xl sm:text-2xl font-bold text-ink-900">
        Сервер недоступен
      </h1>
      <p class="text-sm text-ink-500 mt-2">
        Сервер ШиП-Монитор не отвечает. Попробуйте перепроверить статус через
        минуту.
      </p>

      <div
        v-if="isDev"
        class="mt-5 text-left text-xs bg-ink-50 rounded-xl p-3 text-ink-500"
      >
        <p>Проверь, что бэкенд запущен и адрес указан верно:</p>
        <p class="font-mono mt-1 break-all">
          {{ apiUrl }}
        </p>
      </div>

      <p
        v-if="retryFailed"
        class="text-sm text-red-600 mt-4"
      >
        Сервер всё ещё недоступен
      </p>

      <button
        class="mt-6 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-semibold disabled:opacity-60 touch-target"
        :disabled="checking"
        @click="retry"
      >
        {{ checking ? "Проверяем..." : "Проверить снова" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { checkServerHealth } from "@/data";
import { ROUTES } from "@/constants/routes";

const route = useRoute();
const router = useRouter();

const isDev = import.meta.env.DEV;
const apiUrl = import.meta.env.VITE_API_URL ?? "";

const checking = ref(false);
const retryFailed = ref(false);

const retry = async () => {
  if (checking.value) return;
  checking.value = true;
  retryFailed.value = false;

  const healthy = await checkServerHealth();
  checking.value = false;

  if (!healthy) {
    retryFailed.value = true;
    return;
  }

  const redirect = route.query.redirect;
  const target =
    typeof redirect === "string" && redirect.startsWith("/")
      ? redirect
      : ROUTES.DASHBOARD;

  void router.replace(target);
};
</script>
