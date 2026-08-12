# TASK-071 — Добавить inventory turnover и low-stock report

Статус: pending

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

