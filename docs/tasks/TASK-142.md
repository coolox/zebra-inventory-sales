# TASK-142 — Стабилизировать frontend release gate

Статус: COMPLETED

## Цель

Сделать frontend-проверки полностью автоматическими и стабильными до фиксации Release Candidate, не меняя пользовательские сценарии.

## Границы

- Перевести `npm run lint` с интерактивного legacy `next lint` на non-interactive ESLint CLI.
- Устранить race в Playwright axe check: анализировать modal только после завершения `fade-up` animation либо при reduced motion.
- Определить политику для генерируемых `tmp/` PDF fixtures, не удаляя пользовательские файлы скрытно.
- Не рефакторить `app/page.tsx` и не менять UI, если это не требуется для конкретного release-gate defect.

## Зависимости

TASK-141.

## Критерии готовности

- `npm run lint` не требует ввода и возвращает корректный exit code.
- Полный Playwright suite два последовательных раза проходит desktop/tablet/mobile без retry.
- Demo/live production builds и весь Vitest suite проходят.
- В git не появляются случайные test artifacts.

## Тесты

- `npm run lint`.
- `npm test`.
- `npm run build:demo` и `npm run build:live`.
- Два последовательных `npm run test:e2e`.
- `git diff --check` и `git status --short`.

## Результат

- `npm run lint` переведён с удалённого в Next.js 15 legacy `next lint` на
  non-interactive ESLint 9 CLI с flat config и теми же Next.js
  `core-web-vitals`/TypeScript rules.
- ESLint добавлен в frontend job GitHub Actions перед production build.
- Axe-проверка Receive dialog ждёт не только появления modal, но и финального
  `opacity: 1`, поэтому не анализирует промежуточный кадр `fade-up` animation.
- `tmp/` зафиксирован как локальная директория генерируемых test/visual-QA
  artifacts: git её игнорирует, существующие пользовательские PDF не удалялись.
- Версии ESLint toolchain закреплены совместимо с локальным Node.js 18.18 и CI
  Node.js 20; пользовательские сценарии и UI не изменялись.

## Проверка

- `npm run lint` — exit code 0, 0 errors; 24 существующих warnings остаются
  видимыми и не замаскированы конфигурацией.
- `npm test` — 73 files / 172 tests passed.
- `npm run build:demo` — passed.
- `npm run build:live` — passed.
- Targeted tablet axe regression — 1/1 passed.
- Первый полный `npm run test:e2e` — 57/57 passed, без retry.
- Второй полный `npm run test:e2e` — 57/57 passed, без retry.
- `git diff --check` — passed; `git check-ignore` подтверждает политику `tmp/`;
  случайных Playwright/build artifacts в `git status --short` нет.
