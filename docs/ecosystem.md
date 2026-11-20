# Карта проектов Coldstat

Экосистема кабинета мониторинга температуры: четыре репозитория, локальный
стенд и протоколы взаимодействия между ними. Документ — про то, что нельзя
вычислить из кода одного репозитория: кто чем владеет, как текут данные и как
поднимать/чинить стенд.

## Репозитории и зоны ответственности

| Репозиторий | Путь | Владелец | Роль |
|---|---|---|---|
| `frontend` | `E:\code\frontend` | мы (push) | SPA-кабинет (Vue 3). Ветки `main` = `new-api` = `fix/small-rework` — держим синхронными |
| `cloud` | `E:\code\cloud` | Петров (только чтение) | Бэкенд API v2 + NATS-сабскрайбер. Правки локально НЕ коммитить, баги — репортом |
| `hub-service` | `E:\code\hub-service` | общая (push) | Эмулятор устройства: device/sensors workers, публикация метрик в NATS |
| `landing` | `E:\code\landing` | отдельный проект | Источник дизайн-токенов (`app/assets/css/main.css`), сам ещё не перебрендирован |

## Поток данных

```
hub-service (workers)
  device worker ──── каждые 10с: battery-level, power-connected, heartbeat
  sensors worker ─── каждые 30с: temperature (+ battery/power на датчике)
  declarations ───── каждые 2мин: синк списка датчиков
        │
        ▼  NATS (subject: device.{deviceId}.*)
  .health .metrics .metrics.sensor .sensors .firmware
        │
        ▼  cloud (subscriber → сервисы)
  Postgres: devices, sensors (uuid датчиков: uuid.New() на каждый старт хаба —
            так задумано; декларация каждые 2 мин синкает таблицу)
  ClickHouse: metrics.device_metrics, metrics.sensor_metrics
  Valkey: онлайн-статус (lastSeen)
        │
        ▼  HTTP API v2 (:6767)
  frontend SPA (:5173, прокси /api → 6767)
```

Терминология (договорились с Петровым): **device** — основное устройство
(хаб), **sensor** — дочерний узел, который хаб декларирует. На фронте
протокольных терминов («декларация» и т.п.) в UI быть не должно.

## Локальный стенд (WSL)

Общий порядок подъёма: контейнеры → бэкенд → хаб → Vite. Фоновые процессы —
с `persistent: true`; после остановки wsl-обёртки убивать остаток:
`pkill -f exe/server` внутри WSL.

```powershell
# WSL: & "C:\Program Files\WSL\wsl.exe" -d Ubuntu -u root
# Go в /usr/local/go/bin, в не-логин шелле PATH пуст — запуск через bash -c:

# 1. Инфраструктура
cd /mnt/e/code/cloud && docker compose up -d
#    контейнеры: nats, cloud-postgres-1, cloud-valkey-1, clickhouse

# 2. Бэкенд API v2 (:6767)
cd /mnt/e/code/cloud && /usr/local/go/bin/go run ./cmd/server

# 3. Хаб (identity-файлы device-id/security-key в рабочей директории, gitignored)
cd /mnt/e/code/hub-service && /usr/local/go/bin/go run ./cmd/service

# 4. Фронтенд (Windows, :5173)
npm run dev
```

Учётные данные стенда: Postgres `cloud-db-user / password / cloud-db`
(env контейнера). Логин e2e-пользователя — файл
`C:\Users\armen\AppData\Local\Temp\kilo\login.json` (локальный, не коммитить);
в ответе поле называется `token`; время жизни access-токена — 60 секунд.

## Протокол pull cloud (обязателен)

В рабочем дереве cloud живут локальные незакоммиченные правки (named volumes
в `docker-compose.yml`; логирующий error handler в
`internal/v2/di/connector.go`; NULL-плейсхолдер `updated_at` в INSERT
устройства в `internal/v2/repositories/device/device.go` — баг Петрова,
ожидает апстрима). Поэтому:

```bash
git stash push -m "local fixes" -- docker-compose.yml internal/v2/di/connector.go internal/v2/repositories/device/device.go
git pull --ff-only origin main
git stash pop   # при конфликте — версию cloud поверх, свои дубли отбросить
```

## Цикл синхронизации с API

1. Петров пушит в `cloud` `main` → тянем по протоколу выше.
2. Изменился `specs/openapi.yml` → `npm run api:generate` (oazapfts;
   `src/api/index.ts` руками не править никогда).
3. Адаптация data-слоя под дифф → lint + type-check + test.
4. E2E на стенде: health без авторизации, логин, devices (firmware-поля),
   метрики по имени (`/devices/{id}/metrics/{metric}` — батарея/питание,
   `/devices/{id}/sensors/{sid}/metrics/{metric}` — температура).
5. Перезапуск бэкенда: `pkill -f exe/server` + новый фоновый процесс.

## Известные особенности API

- `from`/`to` в metrics-эндпоинтах опциональны (ISO-строки), `limit` ≥ 10.
- Старые query-эндпоинты (`?metric=`) задепрекейчены — используем ByName.
- `security_key` устройства в БД не хранится (by design); connect асинхронный:
  201 = запрос отправлен, approve не ждём.
- Сенсоры пересоздаются с новыми uuid на каждый старт хаба: старые метрики
  в ClickHouse остаются привязаны к старым uuid.

## Грабли окружения (Windows)

- PowerShell ломает JSON в `-d` у `curl.exe` — тела писать в файл
  (`[IO.File]::WriteAllText`, UTF8 без BOM) и передавать `--data "@file"`.
- Кириллица: правки файлов с русским текстом — полным `write` или
  `[IO.File]::ReadAllText/WriteAllText` с `UTF8Encoding($false)`;
  после правок проверять отсутствие U+FFFD.
- WSL может засыпать (idle-shutdown) — стенд поднимается заново по шагам выше.
- В cloud при старте ворнинг «No CORS origins specified» — не мешает
  (запросы идут через Vite-прокси), чинится настройкой `CORS_ORIGINS` в .env
  cloud (зона Петрова).
