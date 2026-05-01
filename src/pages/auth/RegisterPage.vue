<script setup lang="ts">
import { reactive } from "vue";
import api from "@/api";
import type { AxiosError } from "axios";
import { useRouter } from "vue-router";
import textbox from "../../components/textbox.vue";

const router = useRouter();

const formData = reactive({
  name: "",
  email: "",
  password: "",
});

const handleRegister = async () => {
  try {
    await api.post("/api/auth/register", {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });

    router.push("/auth");
  } catch (error) {
    console.error("Ошибка регистрации:", (error as AxiosError).response?.data || (error as Error).message);
  }
};
</script>

<template>
  <div class="registr-container">
    <textbox v-model="formData.name" placeholder="Имя" />
    <textbox v-model="formData.email" placeholder="Email" class="mt-4" />
    <textbox v-model="formData.password" placeholder="Пароль" type="password" class="mt-4" />
    <button @click="handleRegister" class="mt-6">Зарегистрироваться</button>
  </div>
</template>
