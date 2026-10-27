import { createI18n } from "vue-i18n";

import safeStorage from "@/utils/storage";

import { messages } from "./messages";

export type AppLocale = "ru" | "en";

export const LOCALES: AppLocale[] = ["ru", "en"];

const LOCALE_CHOICE_KEY = "locale-choice";

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

export function storedLocaleChoice(): AppLocale | null {
  const value = safeStorage.getJson(LOCALE_CHOICE_KEY);
  return value === "ru" || value === "en" ? value : null;
}

export function saveLocaleChoice(locale: AppLocale): void {
  safeStorage.setItem(LOCALE_CHOICE_KEY, JSON.stringify(locale));
}

export function negotiateFirstVisitLocale(): AppLocale {
  return navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
}

export function isBotUserAgent(): boolean {
  return /bot|crawl|spider|slurp|headless/i.test(navigator.userAgent);
}
