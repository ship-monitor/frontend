<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-ink-50">
    <div class="ship-card p-8 sm:p-10 max-w-md w-full text-center animate-scale-in">
      <!-- Загрузка -->
      <div v-if="loading" class="space-y-4">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-brand-50 flex items-center justify-center">
          <svg class="w-8 h-8 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="text-lg font-semibold text-ink-900">Подтверждение email...</p>
        <p class="text-sm text-ink-500">Пожалуйста, подождите</p>
      </div>

      <!-- Успех -->
      <div v-else-if="success" class="space-y-4">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-brand-50 flex items-center justify-center">
          <svg class="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p class="text-xl font-bold text-brand-600">Email подтверждён!</p>
        <p class="text-sm text-ink-500">Перенаправление на профиль...</p>
      </div>

      <!-- Ошибка -->
      <div v-else class="space-y-4">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p class="text-xl font-bold text-red-600">Ошибка подтверждения</p>
        <p class="text-sm text-ink-500">{{ error }}</p>
        <button
          @click="$router.push('/profile')"
          class="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-semibold"
        >
          Вернуться в профиль
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { confirmEmail } from "@/data";

const route = useRoute();
const router = useRouter();

const token = route.query.token as string;

const loading = ref(true);
const success = ref(false);
const error = ref("");

onMounted(async () => {
  if (!token) {
    loading.value = false;
    error.value = "Неверная ссылка подтверждения (токен отсутствует)";
    return;
  }

  try {
    await confirmEmail(token);
    success.value = true;
    setTimeout(() => {
      router.push("/profile");
    }, 2000);
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : "Не удалось подтвердить email";
  } finally {
    loading.value = false;
  }
});
</script>
