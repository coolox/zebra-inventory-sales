# TASK-070 — Добавить report breakdown dimensions

Статус: COMPLETED

## Цель

Получать breakdown по Seller, supplier, brand, model и category без изменения financial totals.

## Предполагаемые файлы

- `supabase/migrations/<new>_reporting_dimensions.sql`
- `features/reports/data/load-breakdowns.ts`

## Зависимости

TASK-068.

## Критерии готовности

- Каждая dimension возвращает revenue, cost, margin, units.
- Суммы breakdown согласуются с общим report total.
- Archived entities остаются в history.

## Тесты

- SQL reconciliation per dimension.
- Empty/unknown dimension cases.
- RLS tests.

## Результат

- Добавлен store-scoped `get_reporting_breakdown` RPC для Seller, supplier, brand, model и category поверх общего Istanbul date-range contract.
- Каждая строка возвращает EUR revenue/cost/margin и sold units; exchange top-up относится к dimension исходной confirmed sale, поэтому суммы совпадают с общим report total.
- Archived models и неактивные suppliers не отфильтровываются из historical reporting; nullable supplier показывается как `Unassigned supplier`.
- Добавлен typed `loadBreakdowns` adapter без client-side financial fallback.

## Проверка

- `npm run supabase:test` — 11 files / 130 checks passed: reconciliation всех dimensions, archived history, invalid dimension и RLS.
- `npm test -- --run` — 134/134 passed; `npx tsc --noEmit`, `npm run build`, `git diff --check` — passed.
- Local Supabase снова на паузе; staging/production не изменялись.
