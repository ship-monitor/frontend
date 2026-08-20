# ship-cloud-frontend

## Переменные окружения

В проекте два независимых набора переменных. Они живут в разных `.env` и работают по-разному.

### 1. Сборка фронтенда (Vite)

Файл `.env` в корне проекта. Переменные **запекаются в бандл** на этапе `npm run build` / `docker build`. После сборки изменить их нельзя — переменные из `environment` в compose на готовый статический сайт не влияют (см. `Dockerfile`, где `VITE_API_URL` задаётся при сборке).

- `VITE_API_URL` — базовый URL Ship-бэкенда (используется в `src/api.ts`)
- `VITE_PLAUSIBLE_URL` — URL сервера Plausible для трекинга (`src/App.vue`)
- `VITE_PLAUSIBLE_DOMAIN` — домен сайта, отображаемый в Plausible (`src/App.vue`)

### 2. Docker Compose (рантайм)

Файл `.env` рядом с `docker-compose.yml`. Значения подставляются в yml через `${...}` и/или пробрасываются в контейнеры целиком через `env_file` (у сервисов `frontend` и `directus`).

| Переменная | Куда попадает | Описание |
|---|---|---|
| `SECRET_KEY` | `directus` → `SECRET` | Секрет Directus (подпись токенов). Сгенерировать: `openssl rand -hex 32` |
| `CMS_ADMIN_EMAIL` | `directus` → `ADMIN_EMAIL` | Email администратора Directus |
| `CMS_ADMIN_PASSWORD` | `directus` → `ADMIN_PASSWORD` | Пароль администратора Directus |
| `CMS_URL` | `directus` → `PUBLIC_URL`, `frontend` → `VITE_CMS_URL` | Публичный адрес CMS (например `https://cms.ship-monitor.ru`) |
| `CLOUD_BACKEND_URL` | `frontend` → `VITE_API_URL` (рантайм-переменная контейнера) | URL Ship-бэкенда. Внимание: на собранный SPA не влияет — реальный URL задаётся `VITE_API_URL` при сборке |
| `PLAUSIBLE_BASE_URL` | `plausible` → `BASE_URL`, `frontend` → `VITE_PLAUSIBLE_URL` | Внешний адрес Plausible (например `https://analytics.ship-monitor.ru`) |
| `PLAUSIBLE_TRACKING_DOMAIN` | `frontend` → `VITE_PLAUSIBLE_DOMAIN` (рантайм) | Домен сайта для трекинга |
| `PLAUSIBLE_DB_PASSWORD` | `plausible_db` → `POSTGRES_PASSWORD` | Пароль БД Plausible. Внимание: строка подключения в compose захардкожена (`plausible:plausible@plausible_db`) — при смене пароля менять и её |
| `PLAUSIBLE_SECRET_KEY` | `plausible` → `SECRET_KEY_BASE` | Секрет Plausible. Сгенерировать: `mix phx.gen_secret` |

Переменные Directus, которые не упоминаются в yml, а читаются Directus напрямую из окружения (попадают в контейнер через `env_file`):

- `CORS_ENABLED` — включить CORS (`true`/`false`)
- `CORS_ORIGIN` — список разрешённых origin через запятую. Схема имеет значение: `https://ship-monitor.ru` и `http://ship-monitor.ru` — разные origin. Проверка браузером строгая, с несовпавшим origin заголовок `Access-Control-Allow-Origin` не вернётся
- `CORS_CREDENTIALS` — разрешить запросы с куками (`true`/`false`)

После изменения `.env` контейнеры нужно пересоздать: `docker compose up -d` (простой restart не подхватывает переменные).
