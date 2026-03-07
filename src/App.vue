<template>
  <!-- Обертка, которая делает этот div единственным корневым элементом -->
  <div class="app-layout">
    
    <!-- Хедер показываем везде, кроме страницы авторизации -->
    <Header v-if="$route.path !== '/auth'" />
    
    <!-- Сюда роутер будет подставлять Auth.vue или Dashboard.vue -->
    <router-view />
    
  </div>
</template>

<script setup lang="ts">
import Header from './components/Header.vue'
</script>
