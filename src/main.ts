import { createApp } from "vue";
import App from "@/App.vue";
import { createAppRouter } from "@/router";
import { i18n } from "@/i18n";
import "./styles.css";
import { createPinia } from "pinia";
import { useAuthStore } from "@/stores/authStore";
import { useFaq } from "@/composables/useFaq";
import { useRoadmap } from "@/composables/useRoadmap";
import { ROUTES } from "@/constants/routes";

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(i18n);

// Запускаем проверку сессии (по cookie) в фоне, не блокируя первый рендер.
// Гвард роутера дожидается завершения инициализации через authStore.ready.
const authStore = useAuthStore(pinia);
authStore.initialize();

if (
  ([ROUTES.LANDING, ROUTES.LANDING_EN] as string[]).includes(
    window.location.pathname,
  )
) {
  requestIdleCallback(
    () => {
      useFaq().fetchFaq();
      useRoadmap().fetchRoadmap();
    },
    { timeout: 1000 },
  );
}

app.use(createAppRouter());
app.mount("#app");
