<template>
  <!-- Страницы входа/подтверждения без меню -->
  <div v-if="layout === 'auth'">
    <router-view />
  </div>
  <!-- Лендинг -->
  <landing-layout v-else-if="layout === 'landing'">
    <router-view />
  </landing-layout>
  <!-- Основной layout с адаптивным меню -->
  <application-layout v-else>
    <router-view />
  </application-layout>
  <cookie-banner />
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import type { CustomRouteMeta } from "@/router";
import ApplicationLayout from "@/components/layout/ApplicationLayout.vue";
import LandingLayout from "./components/layout/LandingLayout.vue";
import CookieBanner from "./components/CookieBanner.vue";

const route = useRoute();

// ===== Вычисляемые =====
const layout = computed(
  () => (route.meta as CustomRouteMeta).layout ?? "app"
);

// ===== Plausible Analytics (только в production) =====
// Отключено: self-hosted Plausible не помещается на 2-ГБ сервер.
// Для включения задать VITE_PLAUSIBLE_URL при сборке и раскомментировать блок.
// onMounted(() => {
//   if (!import.meta.env.PROD) return;
//   const plausibleUrl = import.meta.env.VITE_PLAUSIBLE_URL;
//   if (!plausibleUrl) return;
//   const script = document.createElement("script");
//   script.defer = true;
//   script.setAttribute(
//     "data-domain",
//     import.meta.env.VITE_PLAUSIBLE_DOMAIN || "ship-monitor.ru"
//   );
//   script.src = `${plausibleUrl}/js/script.js`;
//   document.head.appendChild(script);
// });
</script>
