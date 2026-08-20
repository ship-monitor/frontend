# AGENTS.md

Guidance for AI agents working in this repository.

## Project

`ship-cloud-frontend` — the web frontend for the Ship Cloud monitoring platform
(ship sensor telemetry, dashboards, organizations, auth). A Single Page
Application built with **Vue 3 + TypeScript + Vite**.

## Tech stack

- **Vue 3** — Composition API (`<script setup lang="ts">`) is the default.
- **TypeScript** — strict mode, `noUncheckedIndexedAccess: true`.
- **Vite 7** — dev server and bundler.
- **Pinia** — state management (see `src/stores`).
- **Vue Router 5** — routing; the router instance is exposed via
  `getAppRouter()` in `src/router/index.ts`.
- **Tailwind CSS v4** — integrated through `@tailwindcss/vite` (no config file;
  styles live in `src/styles.css`).
- **Axios** — HTTP client. Two instances exist:
  - `src/api.ts` — main Ship backend (base URL from `VITE_API_URL`,
    `withCredentials: true`, redirects to login on 401).
  - `src/composables/api_cms.ts` — separate CMS/Strapi API.
- **true-myth** — `Result` type used in the data layer for error handling
  (see `src/data`).
- **@vueuse/core** — Vue composition utilities.

## Commands

```bash
npm run dev          # Start Vite dev server (with --host)
npm run build        # Type-check + production build (parallel)
npm run build-only   # Production build without type-check
npm run type-check   # vue-tsc --build
npm run lint         # eslint
npm run format       # prettier . --write
npm run preview      # Preview the production build
```

Always run `npm run lint` and `npm run type-check` before considering a task
done. They must pass.

## Project structure

```
src/
├── api.ts              # Axios instance for the Ship backend (+ 401 interceptor)
├── main.ts             # App entrypoint
├── App.vue             # Root component
├── styles.css          # Global styles + Tailwind import
├── assets/             # Static assets
├── components/         # Reusable UI components
├── composables/        # Composition functions (useXxx), incl. CMS API client
├── constants/          # App constants (e.g. routes.ts)
├── data/               # Data-access layer returning true-myth Results
├── models/             # Domain models / interfaces
├── pages/              # Route-level views (organized by feature)
├── router/             # Vue Router setup
├── stores/             # Pinia stores
├── types/              # Shared TypeScript types
└── utils/              # Pure helper functions
```

## Conventions

- **Path alias:** import from `src` using `@/...` (e.g.
  `import api from "@/api"`). Configured in both `tsconfig.app.json` and
  `vite.config.ts` — keep them in sync.
- **Routing:** declare every route path in `src/constants/routes.ts` as a
  `ROUTES` entry and add a typed builder to the `route` object. Reference
  routes via these constants/builders, never hardcode path strings elsewhere.
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
- **Types:** shared types live in `src/types`; domain models in
  `src/models`. Avoid `any`.
- **Formatting:** Prettier (config in `.prettierrc.json`). Run
  `npm run format` if touching many files.

## Environment

A `.env` file is required for the dev server and build. Key variables:

- `VITE_API_URL` — Ship backend base URL (consumed in `src/api.ts`).
- CMS and Plausible variables as documented in `README.md`.

Do not commit secrets or real credentials.

## Agent rules

- Do **not** commit unless explicitly asked.
- Do **not** add comments unless requested.
- Follow existing file/style conventions; mimic nearby code.
- When adding dependencies, confirm they are compatible with the versions in
  `package.json` (Node `^20.19.0 || >=22.12.0`).
