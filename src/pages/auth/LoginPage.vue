<script setup lang="ts">
import { ref } from "vue";
import api from "@/api";
import { useRouter } from "vue-router";
import { AxiosError } from "axios";
import textbox from "@/components/textbox.vue";

const email = ref("");
const password = ref("");
const router = useRouter();

const handleLogin = async () => {
  try {
    const response = await api.post("/api/auth/login", {
      email: email.value.trim(),
      password: password.value,
    });

    // Получаем токен и очищаем от кавычек
    let token = response.data.token;
    let refreshToken = response.data.refreshToken;
    let user = response.data.user;

    // Если токен пришел как объект - берем значение
    if (typeof token === "object") {
      token = token.token || token.accessToken || token.access_token;
    }
    if (typeof refreshToken === "object") {
      refreshToken = refreshToken.refreshToken || refreshToken.refresh_token;
    }

    // Очищаем от кавычек и пробелов
    token = String(token || "").replace(/["'\s]/g, "");
    refreshToken = String(refreshToken || "").replace(/["'\s]/g, "");

    if (!token) {
      throw new Error("No token in response");
    }

    console.log("Saving token:", token.substring(0, 20) + "...");

    // Сохраняем чистыми строками без JSON.stringify
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem(
      "user",
      typeof user === "object" ? JSON.stringify(user) : user
    );

    router.push("/");
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Ошибка:", error.response?.data || error.message);
      alert("Неверный логин или пароль");
    }
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 class="text-2xl font-bold mb-6 text-center">Вход</h1>
      <textbox v-model="email" placeholder="Email" class="mb-4" />
      <textbox
        v-model="password"
        placeholder="Password"
        type="password"
        class="mb-6"
      />
      <button
        @click="handleLogin"
        class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Войти
      </button>
      <p class="mt-4 text-center text-sm text-gray-600">
        Нет аккаунта?
        <router-link to="/auth/register" class="text-blue-600 hover:underline">
          Зарегистрироваться
        </router-link>
      </p>
    </div>
  </div>
</template>
