<template>
  <header class="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
    <!-- Логотип -->
    <div class="flex items-center gap-2 font-bold text-xl text-blue-600 tracking-tight">
      <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
        S
      </div>
      <span>Ship Cloud</span>
    </div>

    <!-- Кнопка выхода -->
    <button 
      @click="handleLogout"
      class="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-red-50"
    >
      <span>Выйти</span>
      <svg  class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
</svg>

    </button>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = () => {
  // 1. Очищаем данные из браузера
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // 2. Выкидываем на страницу логина
  router.push('/auth');
};
</script>
