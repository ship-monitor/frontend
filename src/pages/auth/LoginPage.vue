<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import textbox from "@/components/textbox.vue";
import { login } from "@/data/auth";
const router = useRouter();

const form = reactive<{
  email: string;
  password: string;
}>({ email: "", password: "" });

const PAGE_TO_REDIRECT = "/";
const REGISTER_PAGE = "/auth/register";

const handleLogin = async () => {
  const loginResult = await login(form.email, form.password);
  if (!loginResult) {
    alert("Неверный логин или пароль");
    return;
  }
  localStorage.setItem("token", loginResult.token);
  localStorage.setItem("refreshToken", loginResult.refreshToken);
  localStorage.setItem(
    "user",
    typeof loginResult.user === "object"
      ? JSON.stringify(loginResult.user)
      : loginResult.user
  );

  router.push(PAGE_TO_REDIRECT);
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <form
      class="bg-white p-8 rounded-lg shadow-md w-96"
      @submit.prevent="handleLogin"
    >
      <h1 class="text-2xl font-bold mb-6 text-center">Вход</h1>
      <textbox v-model="form.email" placeholder="Email" class="mb-4" />
      <textbox
        v-model="form.password"
        placeholder="Password"
        type="password"
        class="mb-6"
      />
      <input
        value="Войти"
        type="submit"
        class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
      />

      <p class="mt-4 text-center text-sm text-gray-600">
        Нет аккаунта?
        <router-link :to="REGISTER_PAGE" class="text-blue-600 hover:underline">
          Зарегистрироваться
        </router-link>
      </p>
    </form>
  </div>
</template>
