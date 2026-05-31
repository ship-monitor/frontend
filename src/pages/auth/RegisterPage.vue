<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">ШиП Монитор</h1>
        <p class="text-sm text-gray-500 mt-1">Регистрация</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Имя</label>
          <input v-model="name" type="text" autocomplete="name" placeholder="Ваше имя"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input v-model="email" type="email" inputmode="email" autocomplete="email" placeholder="user@example.com"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
          <input v-model="password" type="password" autocomplete="new-password" placeholder="••••••••"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
        </div>

        <button @click="handleRegister" :disabled="!email.trim() || !password || !name.trim()"
          class="w-full bg-green-600 text-white py-3.5 rounded-lg font-medium hover:bg-green-700 active:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target">
          Зарегистрироваться
        </button>
      </div>

      <p class="mt-6 text-center text-sm text-gray-600">
        Уже есть аккаунт?
        <router-link to="/auth/login" class="text-blue-600 font-medium hover:underline">
          Войти
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import api from "@/api";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const name = ref("");
const router = useRouter();

const handleRegister = async () => {
  if (!email.value.trim() || !password.value || !name.value.trim()) return;

  try {
    const response = await api.post("/api/auth/register", {
      email: email.value.trim(),
      password: password.value,
      name: name.value.trim(),
    });

    let token = response.data.token;
    let refreshToken = response.data.refreshToken;
    let user = response.data.user;

    if (typeof token === 'object') {
      token = token.token || token.accessToken || token.access_token;
    }
    if (typeof refreshToken === 'object') {
      refreshToken = refreshToken.refreshToken || refreshToken.refresh_token;
    }

    token = String(token || '').replace(/["'\s]/g, '');
    refreshToken = String(refreshToken || '').replace(/["'\s]/g, '');

    const cleanToken = String(token).replace(/^Bearer\s+/i, '');
    localStorage.setItem("token", cleanToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", typeof user === 'object' ? JSON.stringify(user) : user);

    router.push("/");
  } catch (error: any) {
    console.error("Ошибка:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Ошибка регистрации");
  }
};
</script>