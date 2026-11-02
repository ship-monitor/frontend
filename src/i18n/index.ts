import { createI18n } from "vue-i18n";

import { messages } from "./messages";

// Кабинет одноязычный (ru): i18n остаётся только для CookieBanner.
// Лендинг с ru/en переехал в отдельный проект landing/ (Nuxt SSR).
export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "ru",
  fallbackLocale: "ru",
  messages,
});
