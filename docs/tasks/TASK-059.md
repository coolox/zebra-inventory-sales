# TASK-059 — Сделать приложение installable PWA

Статус: completed

## Цель

Добавить manifest, icons и install-safe metadata для clothing pilot.

## Предполагаемые файлы

- `app/manifest.ts`
- `app/layout.tsx`
- `public/icons/**`
- `next.config.ts`

## Зависимости

TASK-052.

## Критерии готовности

- Manifest содержит Zebra Retail branding, start URL и standalone display.
- Icons корректны на iOS/Android.
- Нет offline обещаний без реализованного offline data strategy.

## Тесты

- Production build.
- Lighthouse PWA manifest checks.
- Install smoke on mobile emulator/device.

## Результат

- Добавлен manifest с Zebra Retail branding, standalone display, `/` start URL и dark theme/background.
- Добавлены any и maskable SVG icons, а также Apple web-app metadata.
- Service worker/offline caching намеренно не добавлены: приложение не заявляет offline availability до появления безопасной offline data strategy.
- Проверены TypeScript и production build с route manifest.
