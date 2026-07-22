<script setup lang="ts">
import { ref } from "vue";
import { ROUTES } from "@/constants/routes";
import { register } from "@/data/auth";
import { useRouter } from "vue-router";

import ShipTextbox from "@/components/ShipTextbox.vue";

const email = ref("");
const password = ref("");
const name = ref("");
const router = useRouter();
const errorMessage = ref<string | null>(null);

const handleRegister = async () => {
  errorMessage.value = null;
  const result = await register(email.value.trim(), password.value, name.value.trim());
  result.match({
    // Регистрация не логинит пользователя (cookie не выдаётся) — ведём на вход.
    Ok: () => {
      router.push({ path: ROUTES.LOGIN, query: { registered: "1" } });
    },
    Err: (err) => {
      errorMessage.value = err;
    },
  });
};
</script>
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 class="text-2xl font-bold mb-6 text-center">Регистрация</h1>
      <div v-if="errorMessage" class="mb-4 text-red-600 text-sm text-center">{{ errorMessage }}</div>
      <ship-textbox
        v-model="name"
        placeholder="Имя"
        name="name"
        class="mb-4"
        autocomplete="given-name"
      />
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
        autocomplete="new-password"
      />
      <button
        @click="handleRegister"
        class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
      >
        Зарегистрироваться
      </button>
      <p class="mt-4 text-center text-sm text-gray-600">
        Уже есть аккаунт?
        <router-link :to="ROUTES.LOGIN" class="text-blue-600 hover:underline">
          Войти
        </router-link>
      </p>
    </div>
  </div>
</template>
