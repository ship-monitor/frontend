import { metrikaHit } from "@/utils/metrika";

// Счётчик инициализируется инлайн-скриптом в nuxt.config (app.head);
// здесь только отправка хитов при клиентской навигации.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.$router.afterEach((to, from) => {
    if (from.name !== undefined) {
      metrikaHit(to.fullPath);
    }
  });
});
