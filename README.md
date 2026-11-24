# coldstat-frontend

Кабинет пользователя «Coldstat» (coldstat.ru): CSR SPA (Vue 3 + Vite), статика раздаётся nginx-контейнером. Публичного контента нет — только страницы за логином (`/dashboard`, `/sensors/:id`, `/profile`, `/connect-device`, `/auth/*`), весь кабинет `noindex`.

Маркетинговый лендинг — отдельный проект; ссылка на него в кабинете идёт через константу `LANDING_URL` (`src/constants/contacts.ts`).

## Переменные окружения

В проекте два независимых набора переменных. Они живут в разных `.env` и работают по-разному.

### 1. Сборка фронтенда (Vite)

Файл `.env` в корне проекта — для локальной разработки. Переменные **запекаются в бандл** на этапе `npm run build` / `docker build`. После сборки изменить их нельзя.

При сборке Docker-образа значения передаются как build-args (см. `build.args` в `docker-compose.yml`): `VITE_API_URL` берётся из `CLOUD_BACKEND_URL` (обязателен — без него сборка упадёт), Plausible-переменные из соответствующих `PLAUSIBLE_*`.

- `VITE_API_URL` — базовый URL бэкенда Coldstat (используется в `src/api/client.ts`)
- `VITE_PLAUSIBLE_URL` — URL сервера Plausible для трекинга (`src/App.vue`). Аналитика временно отключена, см. примечание ниже
- `VITE_PLAUSIBLE_DOMAIN` — домен сайта, отображаемый в Plausible (`src/App.vue`)

### 2. Docker Compose (рантайм)

Файл `.env` рядом с `docker-compose.yml`. Значения подставляются в yml через `${...}`. У `frontend` рантайм-переменных больше нет — только build-args при сборке образа.

| Переменная | Куда попадает | Описание |
|---|---|---|
| `CLOUD_BACKEND_URL` | build-arg `VITE_API_URL` образа `frontend` | URL бэкенда Coldstat, запекается в SPA при сборке. Обязателен (`docker compose build` упадёт без него) |

## Plausible Analytics (временно отключено)

Self-hosted Plausible (ClickHouse + Postgres + BE) не помещался на 2-ГБ сервер, поэтому стек убран из `docker-compose.yml`, а инициализация скрипта закомментирована в `src/App.vue`. Для включения: вернуть сервисы `plausible`, `plausible_db`, `plausible_events_db` из git history, раскомментировать блок в `src/App.vue` и задать `PLAUSIBLE_BASE_URL`, `PLAUSIBLE_DB_PASSWORD`, `PLAUSIBLE_SECRET_KEY` (сгенерировать: `mix phx.gen_secret`), `PLAUSIBLE_TRACKING_DOMAIN` в `.env`.

После изменения `.env` контейнеры нужно пересобрать: `docker compose up -d --build` (простой restart не подхватывает переменные).

**Деплой-заметка:** `CLOUD_BACKEND_URL` обязателен — без него `docker compose` падает на интерполяции с ошибкой `required variable CLOUD_BACKEND_URL is missing a value` ещё до сборки. Если на сервере деплой внезапно упал с этой ошибкой, добавьте в серверный `.env` строку `CLOUD_BACKEND_URL=https://api.coldstat.ru`.
