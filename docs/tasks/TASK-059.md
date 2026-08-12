# TASK-059 — Сделать приложение installable PWA

Статус: pending

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

