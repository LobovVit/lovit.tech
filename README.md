# lovit.tech — Digital-studio LV

Восстановленный сайт студии: статический HTML/CSS/JavaScript и Go API.

## Рабочее развёртывание

`193.124.112.191:443` (Nginx, Let's Encrypt) → VPN → `10.66.66.6:80`
(Traefik, сеть `homelab`) → контейнер `web` → приватный `backend:8080`.
Рабочая директория: `/home/lobov/lovit-site`. Домены: `lovit.tech`, `www.lovit.tech`.
Контейнеры не публикуют порты на хосте; Go API доступен через `/ping`.

```sh
docker compose config --quiet
docker compose up -d --build --wait
docker compose ps
```

Для обновления скопируйте frontend, backend, deploy и docker-compose.yml в рабочую
директорию и повторите команду. Перед обновлением сохраняйте предыдущую директорию
или Git revision; откат выполняется из предыдущего checkout той же командой.
Секретов и пользовательской базы у текущего сайта нет.

TLS завершается на внешнем VPS. Конфигурация расположена в
`/etc/nginx/sites-available/lovit-bootstrap`; сертификат `lovit.tech` также включает
`www.lovit.tech`. Certbot использует webroot `/var/www/certbot`.
Домен `auth.lovit.tech` обслуживает отдельный сервис идентификации и не входит
в контейнеры этого проекта.

## Единый вход (27.09.2026)

Подключён ZITADEL `https://auth.lovit.tech` — отдельный confidential OIDC client
LOVIT Studio, Authorization Code + PKCE, проверка issuer/audience/nonce/state.
Секреты в `.env` (0600, вне Git): OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET.
Callback строго `https://lovit.tech/auth/callback`; www перенаправляется на основной
домен на внешнем Nginx. Backend имеет отдельную сеть для исходящих HTTPS-запросов.

Сессия сайта — случайный host-only Secure HttpOnly cookie, максимум 12 часов,
хранится в памяти одного экземпляра; перезапуск требует повторного входа через IdP.
`GET /auth/me` возвращает только признак входа, без email и provider tokens.
`POST /auth/logout` проверяет Origin и завершает сессию сайта. Общая сессия IdP
сохраняется. Back-channel logout/немедленный отзыв прикладных сессий пока отсутствует.
Сайт не выдаёт платные возможности на основании одного факта входа.

Браузерная проверка: импортированный тестовый bcrypt принят; вход на LOVIT успешен;
переход в FamilyQuest проходит без повторного пароля, но аккаунт без привязки
не получает доступ к семье. Выход с сайта проверен. Тестовый аккаунт деактивирован,
его IdP-сессии отозваны. Пароль реального владельца не запрашивался.

OIDC-адаптер перенесён из FamilyQuest (internal/identity) вместе с тестами проверки
подписи, audience и nonce; синхронизируйте security-исправления между репозиториями.

## Состояние функций

Дизайн, переключение темы, навигация и контакты восстановлены из ветки develop.
Тексты разделов остаются исходными, включая незаполненные тексты-заготовки.
В старом API вход принимал произвольный пароль и выдавал demo-token.
Теперь `/auth/login` и `/auth/signup` возвращают 503 без токена; формы сбора
пароля убраны. Вместо них используется кнопка единого входа.

Tarantool не используется текущим Go-кодом. Исходники сохранены в `tarantool/`,
старая экспериментальная схема — в `docker-compose.legacy.yml`. Она не является
рабочей production-конфигурацией и автоматически не запускается. Данные старого
сервера/резервные копии этим восстановлением не импортировались.
`docker-compose.backend.yml` и прежние GitHub deploy-workflows оставлены для
истории; workflow запускаются только вручную и используют старые GitHub secrets.
Для текущей конфигурации используйте основной docker-compose.yml.

## Проверки

```sh
go -C backend test ./...
go -C backend vet ./...
node --check frontend/script.js
curl -f https://lovit.tech/ping
```

Общий выход использует OIDC end-session и проверенный подписанный back-channel logout.
Кнопка завершает вход в подключённых сервисах текущего браузера. На других устройствах
сессии сохраняются. Реестр LOVIT находится в памяти: после перезапуска нужен новый SSO.
