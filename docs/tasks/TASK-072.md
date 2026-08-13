# TASK-072 — Добавить Owner Reports UI

Статус: COMPLETED

## Цель

Собрать metrics, period, breakdown и inventory reports в отдельный Owner-only раздел.

## Предполагаемые файлы

- `features/reports/ui/reports-dashboard.tsx`
- `app/(dashboard)/reports/page.tsx`
- `components/layout/app-nav.tsx`

## Зависимости

TASK-052, TASK-068, TASK-069, TASK-070, TASK-071.

## Критерии готовности

- Owner видит summary и drill-down; Seller route запрещён.
- Loading/empty/error states не показывают mock values в live.
- Mobile layout сохраняет читаемость таблиц/charts.

## Тесты

- Component role/filter states.
- Playwright report navigation.
- Desktop/mobile visual QA.

## Результат

- Добавлен Owner Reports dashboard на `/reports`: period selector, financial summary, dimension drill-down и low-stock table с responsive horizontal scrolling.
- Seller не получает Reports navigation; component показывает Owner-only boundary. Live mode запрашивает только reporting RPC data и показывает loading/error/retry без mock fallback.

## Проверка

- Component role/load test, `npx tsc --noEmit`, production build и `git diff --check` — passed.
- Playwright desktop Reports direct-link smoke — passed. Staging/production не изменялись; Docker не запускался.
