# TASK-014 — Добавить Playwright smoke-test foundation

Статус: COMPLETED

## Цель

Подключить browser e2e runner для demo и будущего staging smoke testing.

## Предполагаемые файлы

- `package.json`
- `package-lock.json`
- `playwright.config.ts`
- `e2e/smoke.spec.ts`

## Зависимости

Нет.

## Критерии готовности

- Runner поднимает приложение и открывает dashboard.
- Конфигурация поддерживает desktop и mobile viewport.
- Secrets не требуются для demo suite.

## Тесты

- Desktop smoke suite.
- Mobile portrait smoke suite.
- `npm run build`.

## Прогресс

- 2026-08-10: добавлены pinned `@playwright/test` 1.55.0 (совместима с Node 18), `playwright.config.ts`, `test:e2e` и demo smoke suite без secrets.
- Runner поднимает изолированный demo server на localhost:3002; projects покрывают desktop 1440×900 и mobile iPhone 13 viewport на Chromium.
- `npm run test:e2e` прошёл: 2/2; `npm run build` прошёл.
