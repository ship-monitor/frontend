# ship-landing

Публичный лендинг «ШиП-Монитор» (ship-monitor.ru) на **Nuxt 4 + SSR**.

Отдельном проектом живёт кабинет пользователя (CSR SPA, репозиторий `ship-cloud-frontend`); ссылка на него — из этого README и `app/constants/` при необходимости.

## Что внутри

- Страницы: `/` (ru) и `/en` (en) — контент один (`app/components/LandingPage.vue`), различается SEO-локаль.
- SEO (title/description, canonical, hreflang, OG, JSON-LD Organization/WebSite/FAQPage) — `app/composables/useLandingSeo.ts`.
- FAQ и roadmap тянутся из Directus CMS **на сервере** через `useAsyncData` в страницах; модульное состояние композаблов работает как серверный кэш процесса.
- vue-i18n инстанс создаётся на каждый запрос (`app/plugins/i18n.ts`); переговоры локали первого визита — на клиенте (`app/middleware/locale.global.ts`).
- Форма заявки пишет лиды в Directus (`app/composables/useLeads.ts`).
- Yandex.Metrika: инлайн-инициализация в `nuxt.config.ts` (`app.head`), хиты клиентской навигации — `app/plugins/metrika.client.ts`.

## Commands

```bash
npm run dev        # Nuxt dev server (http://localhost:3000)
npm run build      # nuxt build — SSR-бандл в .output/
npm run preview    # запуск собранного SSR-сервера
npm run typecheck  # nuxt typecheck
npm run lint       # eslint
```

## Env

- `VITE_CMS_URL` — опционален; по умолчанию `https://cms.ship-monitor.ru`.

## Docker

```bash
docker build -t ship-landing --build-arg VITE_CMS_URL=https://cms.ship-monitor.ru .
docker run -p 3000:3000 ship-landing
```

Продакшен-рантайм — Node: `node .output/server/index.mjs`, порт 3000 (задаётся `NITRO_PORT`). Реверс-прокси на сервере должен проксировать `ship-monitor.ru` (включая `/en/`) на этот порт.
