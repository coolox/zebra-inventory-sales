# TASK-069 — Добавить report period и custom range

Статус: pending

## Цель

Унифицировать Today, Wednesday-week, month, year и custom date range для reports.

## Предполагаемые файлы

- `features/reports/model/period.ts`
- `features/reports/ui/period-filter.tsx`

## Зависимости

TASK-068.

## Критерии готовности

- Business timezone и Wednesday–Tuesday week используются везде.
- Custom range валидируется.
- Filter contract подходит всем report queries.

## Тесты

- Boundary/date/timezone unit tests.
- Component preset/custom tests.
- DST-safe fixture where relevant.

