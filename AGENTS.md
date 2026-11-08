# AGENTS.md

Guidance for AI agents working in this repository.

## Project

Репозиторий содержит **два независимых фронтенда** «ШиП-Монитор»
(ship-monitor.ru):

- **Корень (`/`)** — `ship-cloud-frontend`: **кабинет пользователя** (CSR SPA,
  Vue 3 + TypeScript + Vite). Страницы за логином: мониторинг, датчики,
  профиль, подключение устройств. Публичного контента нет (`noindex`).
- **`landing/`** — **лендинг на Nuxt 4 (SSR)** со своим `package.json`,
  конфигами и зависимостями. Публичные страницы `/` и `/en`, SEO-мета и
  JSON-LD рендерятся на сервере.

Проекты не имеют общей кодовой базы: правки кабинета — в корне, лендинга — в
`landing/`. Ссылка между ними — константа `LANDING_URL` в
`src/constants/contacts.ts`. «ШиП» — название продукта, не "ship".

## Cabinet (корень репозитория)

SPA на **Vue 3** (Composition API, `<script setup lang="ts">`), TypeScript
(strict, `noUncheckedIndexedAccess`), Vite 7, Pinia, Vue Router, Tailwind CSS
v4, oazapfts, true-myth.

### Commands

```bash
npm run dev          # Start Vite dev server (with --host)
npm run build        # Type-check + production build (parallel)
npm run type-check   # vue-tsc --build
npm run lint         # eslint
npm run test         # vitest run
npm run format       # prettier . --write
npm run api:generate # Regenerate API client from ../cloud/specs/openapi.yml
```

Always run `npm run lint` and `npm run type-check` before considering a task
done. They must pass.

### API client

`src/api/index.ts` is **generated** by oazapfts from
`../cloud/specs/openapi.yml` — never edit it by hand; run
`npm run api:generate` after the spec changes (on Windows the script
delegates to WSL because the oazapfts CLI crashes there).
`src/api/client.ts` configures the generated client at startup
(`configureApi()` in `main.ts`): `VITE_API_URL` base URL, Bearer header,
and a 401 → refresh → retry wrapper. `src/data/*` wraps generated
operations in true-myth `Result`s and problem+json error parsing.

### Project structure

```
src/
├── api/                # Generated oazapfts client + client setup
├── main.ts             # App entrypoint
├── App.vue             # Root component (auth/app layout switch)
├── styles.css          # Global styles + Tailwind import
├── components/         # Reusable UI components
├── constants/          # routes.ts, contacts.ts (incl. LANDING_URL)
├── data/               # Data-access layer returning true-myth Results
├── i18n/               # vue-i18n (ru only; keys for CookieBanner)
├── models/             # Domain models / interfaces
├── pages/              # Route-level views (auth/, sensors/, dashboard…)
├── router/             # Vue Router setup
├── stores/             # Pinia stores
└── utils/              # Pure helper functions
```

### Conventions

- **Path alias:** import from `src` using `@/...` (e.g.
  `import api from "@/api"`). Configured in both `tsconfig.app.json` and
  `vite.config.ts` — keep them in sync.
- **Routing:** declare every route path in `src/constants/routes.ts` as a
  `ROUTES` entry and add a typed builder to the `route` object. Reference
  routes via these constants/builders, never hardcode path strings elsewhere.
  The marketing landing is an external site — link via `LANDING_URL`.
- **State:** use Pinia stores in `src/stores`. Define stores with the options
  syntax (`defineStore("name", { state, getters, actions })`) — match the
  existing `authStore.ts` style.
- **Data access:** the `src/data` layer wraps API calls and returns
  `true-myth` `Result` values; consume with `.map` / `.inspectErr`. Keep
  components free of direct `axios` calls to the Ship backend — go through
  `src/data`.
- **Error handling in components:** the Ship backend axios instance uses
  `validateStatus: () => true`, so HTTP errors arrive as normal responses.
  Inspect `response.status` explicitly; do not rely on thrown rejections for
  non-2xx statuses.
- **Styling:** prefer Tailwind utility classes. Global CSS goes in
  `src/styles.css`.
- **Types:** domain models in `src/models`. Avoid `any`.
- **Formatting:** Prettier (config in `.prettierrc.json`). Run
  `npm run format` if touching many files.

### Environment

A `.env` file is required for the dev server and build (values are baked into
the bundle at build time; Docker passes them as build args):

- `VITE_API_URL` — Ship backend base URL (consumed in `src/api.ts`).
- `VITE_PLAUSIBLE_URL` / `VITE_PLAUSIBLE_DOMAIN` — optional analytics
  (currently disabled; see README.md).

Do not commit secrets or real credentials.

## Landing (`landing/`)

Nuxt 4 SSR-приложение (структура Nuxt 4: код в `landing/app/`).

- Pages `app/pages/index.vue` (ru) и `app/pages/en/index.vue` (en); сама
  страница — `app/components/LandingPage.vue`.
- SEO (мета, canonical, hreflang, OG, JSON-LD Organization/WebSite/FAQPage) —
  в `app/composables/useLandingSeo.ts`, вызывается из страниц.
- FAQ и roadmap тянутся из Directus CMS на сервере через `useAsyncData` в
  страницах (`app/composables/useFaq.ts`, `useRoadmap.ts`); модульное
  состояние работает как серверный кэш.
- vue-i18n создаётся **на каждый запрос** плагином `app/plugins/i18n.ts`
  (синглтон протекал бы между параллельными SSR-запросами с разными локалями).
  Переговоры локали первого визита — только на клиенте
  (`app/middleware/locale.global.ts`).
- В computed-геттерах не вызывать `currentLocale()`/`useNuxtApp()` — head
  резолвится после рендера вне контекста запроса; используйте `localeRef()`.

Commands (run in `landing/`):

```bash
npm run dev          # Nuxt dev server
npm run build        # nuxt build (SSR-бандл в .output/)
npm run preview      # Запуск собранного SSR-сервера
npm run typecheck    # nuxt typecheck
npm run lint         # eslint
```

Env: `VITE_CMS_URL` (опционален; по умолчанию `https://cms.ship-monitor.ru`).

Deploy: в отличие от кабинета (статика в nginx-контейнере), лендинг —
Node-рантайм: `node .output/server/index.mjs`, порт 3000 (см.
`landing/Dockerfile`).

## Agent rules

- Do **not** commit unless explicitly asked.
- Do **not** add comments unless requested.
- Follow existing file/style conventions; mimic nearby code.
- When adding dependencies, confirm they are compatible with the versions in
  the relevant `package.json` (Node `^20.19.0 || >=22.12.0`).
- Changes in the cabinet and landing are independent: running the root
  `npm run lint`/`type-check` does not check `landing/` — run the landing
  commands separately when editing `landing/`.
