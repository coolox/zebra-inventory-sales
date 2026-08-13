# TASK-069 — Добавить report period и custom range

Статус: COMPLETED

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

## Результат

- Добавлен единый date-only contract `ReportPeriod` / `{ from, to }` для всех report queries, включая Today, Wednesday–Tuesday week, month, year и custom range.
- Business calendar всегда вычисляется в `Europe/Istanbul`, независимо от timezone браузера; custom range принимает только реальные упорядоченные ISO-даты.
- Добавлен доступный `PeriodFilter` с preset/custom состояниями и валидацией. Reporting metrics RPC и typed adapter теперь требуют этот range и фильтруют sales/exchange по Istanbul business date.

## Проверка

- Period model/component tests: boundary, Istanbul timezone, DST fixture и custom validation — passed.
- `npm run supabase:test` — 11 files / 123 checks passed.
- `npm test -- --run` — 132/132 passed; `npx tsc --noEmit`, `npm run build`, `git diff --check` — passed.
- Локальный Supabase снова на паузе; staging/production не изменялись.
