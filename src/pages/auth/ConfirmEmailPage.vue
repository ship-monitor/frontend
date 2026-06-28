<template>
  <div class="max-w-lg mx-auto p-4 sm:p-6">
    <div class="bg-white rounded-xl border p-6 text-center">
      <div v-if="loading" class="space-y-3">
        <div class="animate-spin text-4xl">📧</div>
        <p class="text-lg font-medium text-gray-800">Подтверждение email...</p>
      </div>

      <div v-else-if="success" class="space-y-3">
        <div class="text-4xl">✅</div>
        <p class="text-lg font-medium text-green-600">Email подтверждён!</p>
        <p class="text-sm text-gray-500">Перенаправление на профиль...</p>
      </div>

      <div v-else class="space-y-3">
        <div class="text-4xl">❌</div>
        <p class="text-lg font-medium text-red-600">Ошибка подтверждения</p>
        <p class="text-sm text-gray-500">{{ error }}</p>
        <button
          @click="$router.push('/profile')"
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
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
const token = route.params.token as string;

const loading = ref(true);
const success = ref(false);
const error = ref("");

onMounted(async () => {
  if (!token) {
    loading.value = false;
    error.value = "Неверная ссылка подтверждения";
    return;
  }

  try {
    await confirmEmail(token);
    success.value = true;

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        userData.emailVerified = true;
        localStorage.setItem("user", JSON.stringify(userData));
      } catch {
        /* */
      }
    }

    setTimeout(() => {
      router.push("/profile");
    }, 2000);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Не удалось подтвердить email";
  } finally {
    loading.value = false;
  }
});
</script>
