# TASK-131 — Усилить PWA install assets

Статус: pending

## Цель

Довести manifest и install icons до надёжной установки Zebra Retail на Android Chrome и iOS Safari.

## Предполагаемые файлы

- `app/manifest.ts`
- `app/layout.tsx`
- `public/icons/**`
- `e2e/pwa.spec.ts`

## Зависимости

TASK-059.

## Критерии готовности

- Manifest содержит явные PNG icons 192×192 и 512×512.
- Maskable icon имеет безопасную зону и размер 512×512.
- iOS получает PNG `apple-touch-icon` 180×180.
- Manifest, icon URLs, `start_url`, scope, standalone display и theme colors доступны из production build.
- Offline support не заявляется и service worker не добавляется без отдельной стратегии.

## Тесты

- Typecheck и production build.
- Automated manifest schema/asset-size checks.
- Browser check manifest response, icon MIME types и metadata links.

