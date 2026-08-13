# TASK-071 — Добавить inventory turnover и low-stock report

Статус: COMPLETED

## Цель

Рассчитать остаток, sell-through/turnover и low-stock по model/variant на выбранную дату.

## Предполагаемые файлы

- `supabase/migrations/<new>_inventory_reporting.sql`
- `features/reports/data/load-inventory-report.ts`

## Зависимости

TASK-029, TASK-034, TASK-068.

## Критерии готовности

- Balance воспроизводится из movements.
- Low-stock использует configured threshold.
- Нулевые продажи/остатки обрабатываются без деления на ноль.

## Тесты

- SQL balance/turnover fixtures.
- Reconciliation with inventory movements.
- Performance check on staging-sized fixture.

## Результат

- Добавлен store-scoped `get_inventory_report` RPC по model/variant: ledger balance на `to`, sold units, sell-through, turnover и low-stock status.
- Balance вычисляется только из `inventory_movements`; low-stock использует model threshold, затем store policy, затем default `2`.
- Archived models остаются в отчёте. При нулевых sold/balance знаменателях sell-through и turnover возвращают `0`.
- Добавлен typed `loadInventoryReport` adapter с общим Istanbul date-range contract.

## Проверка

- `npm run supabase:test` — 11 files / 134 checks passed: ledger reconciliation, sell-through, low-stock, zero division, reporting RLS и existing regressions.
- `npm test -- --run` — 136/136 passed; `npx tsc --noEmit`, `npm run build`, `git diff --check` — passed.
- Query использует существующий `(variant_id, store_id, occurred_at)` movement index; local fixture подтверждает ledger path. Staging/production не изменялись, local Supabase снова на паузе.
