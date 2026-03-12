<template>
  <header class="flex justify-between p-2 items-center border-b border-black">
    <!-- Логотип -->
    <div>
      <img
        loading="lazy"
        :src="BIG_LOGO"
        :alt="COMPANY_NAME"
        :title="COMPANY_NAME"
        class="w-40"
      />
    </div>

    <!-- Кнопка выхода -->
    <div>
      <button
        title="Выйти"
        @click="handleLogout"
        class="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-red-50"
      >
        <span>Выйти</span>
        <svg
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import BIG_LOGO from "@/assets/big-logo.png";
import { useRouter } from "vue-router";

const COMPANY_NAME = "ШиП Монитор";

const router = useRouter();

const handleLogout = () => {
  // 1. Очищаем данные из браузера
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  // 2. Выкидываем на страницу логина
  router.push("/auth");
};
</script>
