# PWA demo preview

## Назначение

Отдельный HTTPS preview для установки Zebra Retail PWA на физических устройствах. Это не production, не VPS и не TASK-079 staging.

## Адрес и владелец

- URL: `https://zebra-inventory-sales.vercel.app`
- Hosting owner: Vercel team `coolox's projects`
- Source: private GitHub repository `coolox/zebra-inventory-sales`, branch `main`
- Режим: `NEXT_PUBLIC_APP_MODE=demo` для Production and Preview deployments.

## Границы безопасности

- В проекте Vercel не заданы Supabase URL или publishable key.
- Preview использует только локальные demo data; он не подключён к VPS, staging или production backend.
- `.env*` исключены из Git; в repository хранится только безопасный `.env.example`.

## Обновление preview

1. Сделать и проверить локальные изменения.
2. Закоммитить их в `main`.
3. Выполнить `git push origin main`.
4. Vercel автоматически пересоберёт `https://zebra-inventory-sales.vercel.app`.
5. Открыть URL с телефона и обновить страницу перед повторной PWA-проверкой.

Если менялись PWA icons, удалить старую установленную Zebra с телефона, закрыть браузер и установить приложение заново: Android/iOS launcher может кэшировать старый icon.

## Выполненная remote-проверка

- HTTPS root ответил `200` и отдал HSTS.
- `/manifest.webmanifest` отдаёт `display: standalone` и PNG icons 192, 512 и maskable 512.
- Desktop и viewport 390×844 открывают demo dashboard; mobile navigation и New sale доступны.
