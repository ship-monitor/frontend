import { createAppI18n } from "@/i18n";

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = createAppI18n();
  nuxtApp.vueApp.use(i18n);

  return {
    provide: {
      i18n,
    },
  };
});
