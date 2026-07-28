# ship-cloud-frontend

## Compose

For running compose you need to create `.env` file with following variables:

- `VITE_API_URL` - ship backend url
- `CMS_ADMIN_EMAIL`
- `CMS_ADMIN_PASSWORD`
- `SECRET_KEY`


# ===== Plausible Analytics =====
# URL, по которому Plausible доступен извне (например https://analytics.ship-monitor.ru)
PLAUSIBLE_BASE_URL=https://analytics.ship-monitor.ru
# Пароль для БД Plausible
PLAUSIBLE_DB_PASSWORD=change_me_to_a_strong_password
# Секретный ключ (сгенерировать через: mix phx.gen.secret)
PLAUSIBLE_SECRET_KEY_BASE=change_me_to_a_long_random_string
# Домен сайта для трекинга
PLAUSIBLE_TRACKING_DOMAIN=ship-monitor.ru
