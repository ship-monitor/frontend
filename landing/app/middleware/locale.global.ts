import {
  isBotUserAgent,
  negotiateFirstVisitLocale,
  saveLocaleChoice,
  setLocale,
  storedLocaleChoice,
} from "@/i18n";

export default defineNuxtRouteMiddleware((to) => {
  setLocale(to.path === "/en" || to.path.startsWith("/en/") ? "en" : "ru");

  // Переговоры локали первого визита — только на клиенте (localStorage/navigator).
  // Сервер всегда рендерит запрошенный путь, чтобы не редиректить
  // вернувшегося пользователя при каждой загрузке.
  if (import.meta.client) {
    const isLanding = to.path === "/" || to.path === "/en";

    if (isLanding && storedLocaleChoice() === null && !isBotUserAgent()) {
      const negotiated = negotiateFirstVisitLocale();
      saveLocaleChoice(negotiated);

      if (negotiated === "en" && to.path === "/") {
        return navigateTo("/en", { redirectCode: 302 });
      }
      if (negotiated === "ru" && to.path === "/en") {
        return navigateTo("/");
      }
    }
  }
});
