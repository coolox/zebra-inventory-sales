# TASK-070 — Добавить report breakdown dimensions

Статус: pending

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

