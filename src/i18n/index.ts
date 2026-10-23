import { createI18n } from "vue-i18n";

import { messages } from "./messages";

export type AppLocale = "ru" | "en";

export const LOCALES: AppLocale[] = ["ru", "en"];

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "ru",
  fallbackLocale: "ru",
  messages,
});

export function setLocale(locale: AppLocale): void {
  i18n.global.locale.value = locale;
}

export function currentLocale(): AppLocale {
  return i18n.global.locale.value as AppLocale;
}
