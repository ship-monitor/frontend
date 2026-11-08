import { createApp } from "vue";
import App from "@/App.vue";
import { createAppRouter } from "@/router";
import { i18n } from "@/i18n";
import "./styles.css";
import { createPinia } from "pinia";
import { useAuthStore } from "@/stores/authStore";
import { configureApi } from "@/api/client";

// Сгенерированный клиент (src/api/index.ts) настраивается до любого запроса:
// baseUrl из окружения + Bearer-заголовок и авто-refresh при 401.
configureApi();

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(i18n);

// Запускаем проверку сессии (по Bearer-токену) в фоне, не блокируя первый рендер.
// Гвард роутера дожидается завершения инициализации через authStore.ready.
const authStore = useAuthStore(pinia);
authStore.initialize();

const router = createAppRouter();
app.use(router);

router.isReady().then(() => app.mount("#app"));
