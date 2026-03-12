<template>
  <!-- Обертка, которая делает этот div единственным корневым элементом -->
  <div class="app-layout">
    <!-- Хедер показываем везде, кроме страницы авторизации -->
    <TheHeader v-if="$route.path !== '/auth'" />

    <!-- Сюда роутер будет подставлять Auth.vue или Dashboard.vue -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import TheHeader from "./components/TheHeader.vue";
</script>
