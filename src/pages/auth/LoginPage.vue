<script setup lang="ts">
import { computed, ref } from "vue";
import { ROUTES } from "@/constants/routes";
import { login } from "@/data/auth";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

import ShipTextbox from "@/components/ShipTextbox.vue";

const email = ref("");
const password = ref("");
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const errorMessage = ref<string | null>(null);

const justRegistered = computed(() => route.query.registered === "1");

const handleLogin = async () => {
  errorMessage.value = null;
  const result = await login(email.value.trim(), password.value);
  await result.match({
    Ok: async () => {
      // Cookie уже установлена бэкендом, подтягиваем данные пользователя.
      await authStore.checkLogin();
      // Разрешаем только внутренние пути, чтобы избежать open-redirect.
      const redirect = route.query.redirect;
      const target =
        typeof redirect === "string" &&
        redirect.startsWith("/") &&
        !redirect.startsWith("//")
          ? redirect
          : ROUTES.DASHBOARD;
      router.push(target);
    },
    Err: async (err) => {
      errorMessage.value = err;
    },
  });
};
</script>
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 class="text-2xl font-bold mb-6 text-center">Вход</h1>
      <div v-if="justRegistered" class="mb-4 text-green-600 text-sm text-center">
        Регистрация успешна. Войдите в аккаунт.
      </div>
      <div v-if="errorMessage" class="mb-4 text-red-600 text-sm text-center">{{ errorMessage }}</div>
      <ship-textbox
        v-model="email"
        placeholder="Email"
        name="email"
        class="mb-4"
        autocomplete="email"
      />
      <ship-textbox
        v-model="password"
        placeholder="Password"
        name="password"
        type="password"
        class="mb-6"
        autocomplete="current-password"
      />
      <input
        @click.prevent="handleLogin"
        value="Войти"
        type="submit"
        class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
      />
      <p class="mt-4 text-center text-sm text-gray-600">
        Нет аккаунта?
        <router-link
          :to="ROUTES.REGISTER"
          class="text-blue-600 hover:underline"
        >
          Зарегистрироваться
        </router-link>
      </p>
    </div>
  </div>
</template>
