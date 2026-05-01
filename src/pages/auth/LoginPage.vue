<script setup lang="ts">
import { ref } from "vue";
import api from "@/api";
import { useRouter } from "vue-router";
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

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    router.push("/");
  } catch (error) {
    console.error("Ошибка:", error.response?.data || error.message);
    alert("Неверный логин или пароль");
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 class="text-2xl font-bold mb-6 text-center">Вход</h1>
      <textbox v-model="email" placeholder="Email" class="mb-4" />
      <textbox v-model="password" placeholder="Password" type="password" class="mb-6" />
      <button @click="handleLogin"
        class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
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
