---
name: stand-ops
class: project
description: >-
  Local Coldstat stand operations: raise/restart WSL services (cloud backend,
  hub, Vite), e2e smoke check, cloud pull protocol, CORS/env gotchas. Use
  when the stand is down or stale, after pulling Petrov's cloud changes,
  when verifying that metrics flow end-to-end, or when smoke checks fail.
paths: "scripts/e2e-smoke.mjs,docs/ecosystem.md"
---

# Local stand operations (Coldstat)

Full map: `docs/ecosystem.md` (repos, data flow, protocols). Quick reference:

## Smoke check

```bash
npm run e2e:smoke   # health → login → devices → battery → sensor temperature
```

- Hits the LIVE stand at `API_URL` (default `http://localhost:6767`); not a
  unit test.
- Credentials: `%TEMP%/kilo/login.json` (fields `email`/`password`) or
  `E2E_EMAIL`/`E2E_PASSWORD` env vars.
- Access token lives 60 seconds; the script consumes it immediately.
- Failure hints: "is the hub running?" → hub process down; "declaration sync
  broken?" → sensors table has stale uuids (cloud InsertSensor / declaration
  pipeline broken — report to Petrov, do not commit into cloud).

## Stand lifecycle

Order: containers → backend → hub → Vite. Background processes run with
`persistent: true`. After stopping WSL wrappers, kill leftovers inside WSL:
`pkill -f 'go-build.*/(exe/)?server$'` (hub: same pattern with `service`).
`go run` keeps the binary in `~/.cache/go-build/<hash>-d/`, so the old
`exe/server` pattern matches nothing.

WSL stops the distro ~15 s after the last `wsl.exe` session ends (the VM
lingers ~60 s more). Keep a session open — a running backend or hub does —
while bringing the stand up, and chain WSL steps in one call. All containers
carry `restart: always` (local compose fix) and come back on the next WSL
call by themselves; backend and hub must be started again.

```powershell
# WSL: & "C:\Program Files\WSL\wsl.exe" -d Ubuntu -u root
cd /mnt/e/code/cloud && docker compose up -d          # nats, postgres, valkey, clickhouse
cd /mnt/e/code/cloud && /usr/local/go/bin/go run ./cmd/server   # API :6767
cd /mnt/e/code/hub-service && /usr/local/go/bin/go run ./cmd/service  # hub
npm run dev                                            # Vite :5173, proxy /api → 6767
```

Go lives in `/usr/local/go/bin` — PATH is empty in non-login shells, always
`bash -c "cd … && /usr/local/go/bin/go run …"`.

## Extra hubs (multi-device stand)

`hub-service` reads `device-id` / `security-key` / `firmware.json` from its
working directory. To emulate more hubs:

```bash
cd /mnt/e/code/hub-service && /usr/local/go/bin/go build -o /tmp/hubs/hub ./cmd/service
# per instance: /tmp/hubs/instN with uuidgen > device-id, openssl rand -hex 16
# > security-key, firmware.json; run from that dir (MODE=DEVELOPMENT)
```

Connect each via API (`POST /api/v2/devices` {deviceId, securityKey}, Bearer
token from login; hub auto-approves, device appears after approval). Identity
files of instance N are printed by the setup script; keep them to reconnect
after restarts.

## Cloud pull protocol (mandatory)

`../cloud` is Petrov's repo; a local uncommitted fix lives in its tree
(docker-compose.yml: named volumes, `restart: always` for postgres and
valkey). Pull:

```bash
git stash push -m "local fixes" -- docker-compose.yml
git pull --ff-only origin main
git stash pop   # on conflict prefer cloud's version, drop local duplicates
```

If `specs/openapi.yml` changed → `npm run api:generate`, adapt the data
layer, run lint/type-check/test, restart backend, `npm run e2e:smoke`.

## Domain rules (learned the hard way)

- Device = hub: it has NO temperature. Temperature belongs to sensors only
  (`/devices/{id}/sensors/{sid}/metrics/temperature`). Never render
  device-level temperature in UI.
- Sensors get new uuid on every hub start (by design); ClickHouse history
  stays bound to old uuids.
- Metrics endpoint: `limit` is 10–1000, points come oldest-first and `limit`
  cuts the newest ones. The last element of a wide window is NOT the latest
  value; `readLatest` in `src/data/index.ts` narrows the window (5 min → 8 h
  → 24 h) and pages forward.
- Cloud `.env` is gitignored: Petrov's values (e.g. `CORS_ORIGINS`) never
  arrive via git — maintain the local copy by hand.
