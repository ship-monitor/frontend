import { createI18n } from "vue-i18n";
import type { Ref } from "vue";
import { useNuxtApp } from "#imports";

import safeStorage from "@/utils/storage";

import { messages } from "./messages";

export type AppLocale = "ru" | "en";

export const LOCALES: AppLocale[] = ["ru", "en"];

const LOCALE_CHOICE_KEY = "locale-choice";

// Инстанс создаётся на каждый запрос (плагином): глобальный синглтон vue-i18n
// на сервере «протекал» бы между параллельными запросами с разными локалями.
export const createAppI18n = () =>
  createI18n({
    legacy: false,
    globalInjection: true,
    locale: "ru",
    fallbackLocale: "ru",
    messages,
  });

export type AppI18n = ReturnType<typeof createAppI18n>;

export function setLocale(locale: AppLocale): void {
  useNuxtApp().$i18n.global.locale.value = locale;
}

export function currentLocale(): AppLocale {
  return useNuxtApp().$i18n.global.locale.value as AppLocale;
}

// Вызывается один раз в setup-контексте: возвращает реактивный ref локали
// текущего i18n-инстанса. Чтение ref в computed-геттерах безопасно и вне
// контекста Nuxt (unhead резолвит head после завершения рендера).
export function localeRef(): Ref<AppLocale> {
  return useNuxtApp().$i18n.global.locale as Ref<AppLocale>;
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
