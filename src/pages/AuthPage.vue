<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router"; // Добавь импорт
import textbox from "../components/textbox.vue";

const email = ref(""); // Переименовали переменную
const password = ref("");
const router = useRouter(); // Инициализируй роутер

const handleLogin = async () => {
  try {
    const response = await axios.post("/api/auth/login", {
      email: email.value,
      password: password.value,
    });

    // 1. Сохраняем токены
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("refreshToken", response.data.refreshToken);

    // 2. Сохраняем инфу о юзере (опционально)
    localStorage.setItem("user", JSON.stringify(response.data.user));

    console.log("Успешный вход!", response.data.user);

    // 3. ПЕРЕХОДИМ на главную страницу (или /dashboard)
    router.push("/");
  } catch (error) {
    console.error("Ошибка:", error.response?.data || error.message);
    alert("Неверный логин или пароль");
  }
};
</script>

<template>
  <!-- Все элементы ДОЛЖНЫ быть внутри одного общего тега -->
  <div class="auth-container">
    <textbox v-model="email" placeholder="Email" class="mb-4" />

    <textbox
      v-model="password"
      placeholder="Password"
      type="password"
      class="mb-6"
    />

    <button @click="handleLogin">Login</button>
  </div>
</template>
