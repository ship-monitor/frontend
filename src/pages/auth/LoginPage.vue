<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { login } from "@/data/auth";
import ShipTextbox from "@/components/ShipTextbox.vue";
import { ROUTES } from "@/constants/routes";
const router = useRouter();

const form = reactive<{
  email: string;
  password: string;
}>({ email: "", password: "" });

const PAGE_TO_REDIRECT = ROUTES.DASHBOARD;

const handleLogin = async () => {
  const loginResult = await login(form.email, form.password);

  if (loginResult.isErr) {
    alert("Неверный логин или пароль");
    console.error("Failed login: %s", loginResult.error);
    return;
  }

  console.debug("Redirecting to " + PAGE_TO_REDIRECT + "...");
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
      <ship-textbox
        v-model="form.email"
        placeholder="Email"
        name="email"
        class="mb-4"
        autocomplete="email"
      />
      <ship-textbox
        v-model="form.password"
        placeholder="Password"
        name="password"
        type="password"
        class="mb-6"
        autocomplete="current-password"
      />
      <input
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
    </form>
  </div>
</template>
