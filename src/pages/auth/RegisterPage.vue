<script setup lang="ts">
import { ref } from "vue";
import api from "@/api";
import { useRouter } from "vue-router";
import textbox from "@/components/textbox.vue";
import { AxiosError } from "axios";

const email = ref("");
const password = ref("");
const name = ref("");
const router = useRouter();

const handleRegister = async () => {
  try {
    const response = await api.post("/api/auth/register", {
      email: email.value.trim(),
      password: password.value,
      name: name.value.trim(),
    });

    // Обрабатываем токен так же как в логине
    let token = response.data.token;
    let refreshToken = response.data.refreshToken;
    let user = response.data.user;

    if (typeof token === "object") {
      token = token.token || token.accessToken || token.access_token;
    }
    if (typeof refreshToken === "object") {
      refreshToken = refreshToken.refreshToken || refreshToken.refresh_token;
    }

    token = String(token || "").replace(/["'\s]/g, "");
    refreshToken = String(refreshToken || "").replace(/["'\s]/g, "");

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
      alert("Ошибка регистрации");
    }
    console.error("Ошибка:", error);
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 class="text-2xl font-bold mb-6 text-center">Регистрация</h1>
      <textbox v-model="name" placeholder="Имя" class="mb-4" />
      <textbox v-model="email" placeholder="Email" class="mb-4" />
      <textbox
        v-model="password"
        placeholder="Password"
        type="password"
        class="mb-6"
      />
      <button
        @click="handleRegister"
        class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
      >
        Зарегистрироваться
      </button>
      <p class="mt-4 text-center text-sm text-gray-600">
        Уже есть аккаунт?
        <router-link to="/auth/login" class="text-blue-600 hover:underline">
          Войти
        </router-link>
      </p>
    </div>
  </div>
</template>
