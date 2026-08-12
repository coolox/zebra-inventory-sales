# TASK-068 — Добавить reporting metrics API

Статус: pending

## Цель

Получать оборот, себестоимость, margin, sale count, units и average ticket из confirmed financial snapshots.

## Предполагаемые файлы

- `supabase/migrations/<new>_reporting_metrics.sql`
- `features/reports/data/load-metrics.ts`

## Зависимости

TASK-063, TASK-065.

## Критерии готовности

- Cancelled/reversed operations учитываются корректно.
- Все totals представлены в EUR snapshot.
- RLS ограничивает store scope.

## Тесты

- SQL fixtures sale/cancel/exchange.
- Metric reconciliation against raw lines.
- RLS tests.

