# ship-cloud-frontend

## Переменные окружения

В проекте два независимых набора переменных. Они живут в разных `.env` и работают по-разному.

### 1. Сборка фронтенда (Vite)

Файл `.env` в корне проекта — для локальной разработки. Переменные **запекаются в бандл** на этапе `npm run build` / `docker build`. После сборки изменить их нельзя.

При сборке Docker-образа значения передаются как build-args (см. `build.args` в `docker-compose.yml`): `VITE_API_URL` берётся из `CLOUD_BACKEND_URL` (обязателен — без него сборка упадёт), `VITE_CMS_URL` из `CMS_URL`, Plausible-переменные из соответствующих `PLAUSIBLE_*`.

- `VITE_API_URL` — базовый URL Ship-бэкенда (используется в `src/api.ts`)
- `VITE_PLAUSIBLE_URL` — URL сервера Plausible для трекинга (`src/App.vue`). Аналитика временно отключена, см. примечание ниже
- `VITE_PLAUSIBLE_DOMAIN` — домен сайта, отображаемый в Plausible (`src/App.vue`)

### 2. Docker Compose (рантайм)

Файл `.env` рядом с `docker-compose.yml`. Значения подставляются в yml через `${...}`; сервис `directus` дополнительно получает файл целиком через `env_file`. У `frontend` рантайм-переменных больше нет — только build-args при сборке образа.

| Переменная | Куда попадает | Описание |
|---|---|---|
| `SECRET_KEY` | `directus` → `SECRET` | Секрет Directus (подпись токенов). Сгенерировать: `openssl rand -hex 32`. Обязателен |
| `CMS_ADMIN_EMAIL` | `directus` → `ADMIN_EMAIL` | Email администратора Directus. Обязателен |
| `CMS_ADMIN_PASSWORD` | `directus` → `ADMIN_PASSWORD` | Пароль администратора Directus. Обязателен |
| `CMS_URL` | `directus` → `PUBLIC_URL`, build-arg `VITE_CMS_URL` образа `frontend` | Публичный адрес CMS (например `https://cms.ship-monitor.ru`). Используется как baseURL CMS-клиента (`src/composables/api_cms.ts`); при отсутствии — захардкоженный `https://cms.ship-monitor.ru`. Обязателен |
| `CLOUD_BACKEND_URL` | build-arg `VITE_API_URL` образа `frontend` | URL Ship-бэкенда, запекается в SPA при сборке. Обязателен (`docker compose build` упадёт без него) |
| `DIRECTUS_DB_PASSWORD` | `database` → `POSTGRES_PASSWORD`, `directus` → `DB_PASSWORD` | Пароль БД Directus/Postgres. Обязателен. Применяется только при инициализации кластера — для существующей БД см. заметку ниже |
| `DIRECTUS_VERSION` | образ `directus` | Точный патч-пин версии Directus (например `11.17.4`). Обязателен — `latest` и мутабельные мажорные теги (`11`) запрещены: Directus запускает миграции БД автоматически, миграции необратимы, откат на меньшую версию ломает БД. Пин должен быть не ниже версии, работающей на сервере (узнать: `docker exec <directus> node -e "console.log(require('./package.json').version)"`) |

## Plausible Analytics (временно отключено)

Self-hosted Plausible (ClickHouse + Postgres + BE) не помещался на 2-ГБ сервер, поэтому стек убран из `docker-compose.yml`, а инициализация скрипта закомментирована в `src/App.vue`. Для включения: вернуть сервисы `plausible`, `plausible_db`, `plausible_events_db` из git history, раскомментировать блок в `src/App.vue` и задать `PLAUSIBLE_BASE_URL`, `PLAUSIBLE_DB_PASSWORD`, `PLAUSIBLE_SECRET_KEY` (сгенерировать: `mix phx.gen_secret`), `PLAUSIBLE_TRACKING_DOMAIN` в `.env`.

Переменные Directus, которые не упоминаются в yml, а читаются Directus напрямую из окружения (попадают в контейнер через `env_file`):

- `CORS_ENABLED` — включить CORS (`true`/`false`)
- `CORS_ORIGIN` — список разрешённых origin через запятую. Схема имеет значение: `https://ship-monitor.ru` и `http://ship-monitor.ru` — разные origin. Проверка браузером строгая, с несовпавшим origin заголовок `Access-Control-Allow-Origin` не вернётся
- `CORS_CREDENTIALS` — разрешить запросы с куками (`true`/`false`)

После изменения `.env` контейнеры нужно пересоздать: `docker compose up -d` (простой restart не подхватывает переменные).

**Деплой-заметка:** `CLOUD_BACKEND_URL` обязателен — без него `docker compose` падает на интерполяции с ошибкой `required variable CLOUD_BACKEND_URL is missing a value` ещё до сборки. Если на сервере деплой внезапно упал с этой ошибкой, добавьте в серверный `.env` строку `CLOUD_BACKEND_URL=https://api.ship-monitor.ru`.

**Смена пароля БД на существующем сервере.** `DIRECTUS_DB_PASSWORD` применяется только при инициализации нового кластера Postgres. Для уже развёрнутой БД (пароль по умолчанию был `directus`):

```bash
docker compose exec database psql -U directus -c "ALTER USER directus PASSWORD '<новый-пароль>';"
```

затем обновите `DIRECTUS_DB_PASSWORD` в `.env` и `docker compose up -d`.

**Обновление версий образов.** Postgis-образ пинится на PostgreSQL 13 (`postgis/postgis:13-3.4`) — 13-я ветка EOL, мажорный апгрейд требует `pg_dump`/`pg_restore` (остановите стек, сделайте дамп, поднимите с новым образом, восстановите). Directus обновляйте только на большую версию (`DIRECTUS_VERSION`) после бэкапа `./data/database` — миграции Directus необратимы.
