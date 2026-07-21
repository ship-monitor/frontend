<template>
  <cookie-banner />
  <!-- Страницы входа/регистрации без меню -->
  <div v-if="isAuthPage">
    <router-view />
  </div>
  <!-- Лендинг для неавторизованных -->
  <div v-else-if="isLandingPage">
    <router-view />
  </div>
  <!-- Основной layout с адаптивным меню -->
  <application-layout v-else>
    <router-view />
  </application-layout>
</template>
<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ROUTES } from "@/constants/routes";
import ApplicationLayout from "@/components/layout/ApplicationLayout.vue";
import CookieBanner from "@/components/CookieBanner.vue";
import { useAuthStore } from "@/stores/authStore";

const route = useRoute();

const authStore = useAuthStore();
onMounted(async () => {
  await authStore.initialize();
});

// ===== Вычисляемые =====
const isAuthPage = computed(() => route.path.startsWith("/auth"));
const isLandingPage = computed(() => route.path === ROUTES.LANDING);
</script>
