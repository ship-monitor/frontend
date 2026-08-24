<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-ink-50">
    <div
      class="ship-card p-8 sm:p-10 max-w-md w-full text-center animate-scale-in"
    >
      <!-- Загрузка -->
      <div v-if="loading" class="py-4">
        <svg
          class="w-7 h-7 text-brand-500 animate-spin mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p class="text-lg font-semibold text-ink-900">Подтверждение email...</p>
        <p class="text-sm text-ink-500 mt-1">Пожалуйста, подождите</p>
      </div>

      <!-- Успех -->
      <div v-else-if="success" class="py-4">
        <svg
          class="w-12 h-12 text-brand-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <p class="text-xl font-bold text-ink-900">Email подтверждён</p>
        <p class="text-sm text-ink-500 mt-1">Перенаправление на профиль...</p>
      </div>

        <!-- Ошибка -->
      <div v-else class="py-4">
        <p class="text-xl font-bold text-ink-900 mb-1">Ошибка подтверждения</p>
        <p class="text-sm text-red-600 mt-1">{{ error }}</p>
        <button
          @click="$router.push(ROUTES.PROFILE)"
          class="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-semibold"
        >
          Вернуться в профиль
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { confirmEmail } from "@/data";
import { ROUTES } from "@/constants/routes";

const route = useRoute();
const router = useRouter();

const rawToken = route.query.token;
const token =
  typeof rawToken === "string" && rawToken.trim().length > 0
    ? rawToken.trim()
    : null;

const loading = ref(true);
const success = ref(false);
const error = ref("");

let redirectTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(async () => {
  if (!token) {
    loading.value = false;
    error.value = "Неверная ссылка подтверждения (токен отсутствует)";
    return;
  }

  const result = await confirmEmail(token);
  result
    .map(() => {
      success.value = true;
      redirectTimer = setTimeout(() => {
        router.push(ROUTES.PROFILE);
      }, 2000);
    })
    .inspectErr((err) => {
      error.value = err;
    })
    .unwrapOr(undefined);

  loading.value = false;
});

onUnmounted(() => {
  if (redirectTimer) clearTimeout(redirectTimer);
});
</script>
