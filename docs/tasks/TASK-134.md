# TASK-134 — Развернуть demo HTTPS preview для PWA

Статус: completed

## Цель

Опубликовать временный HTTPS preview для установки PWA на телефоне без подключения production или live данных.

## Предполагаемые файлы

- `.env.example`
- `docs/operations/PWA_PREVIEW.md`
- hosting configuration только при необходимости

## Зависимости

TASK-131, TASK-132, TASK-133.

## Критерии готовности

- Preview опубликован на отдельном HTTPS URL в `demo` mode.
- Preview не содержит Supabase credentials и не обращается к staging/production backend.
- URL открывается с телефона, manifest и icons доступны по HTTPS.
- Deployment не считается TASK-079 live staging и не меняет VPS/production.
- URL, deployment owner и способ обновления записаны без секретов.

## Тесты

- Remote health and manifest checks.
- No-secrets/environment boundary check.
- Desktop/mobile smoke против preview URL.

## Внешний gate

Перед публикацией требуется явное разрешение владельца на hosting login/deployment и выбранный preview provider. Рекомендованный вариант — Vercel Preview.

## Результат

- Создан отдельный private GitHub source `coolox/zebra-inventory-sales` и Vercel project в team `coolox's projects`.
- HTTPS demo URL: `https://zebra-inventory-sales.vercel.app`.
- Для Production and Preview environment задан `NEXT_PUBLIC_APP_MODE=demo`; Supabase variables не заданы.
- Remote HTTPS/manifest и desktop/mobile smoke пройдены. Порядок обновления и владелец зафиксированы в `docs/operations/PWA_PREVIEW.md`.
