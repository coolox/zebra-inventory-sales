# TASK-098 — Добавить backend transfer между магазинами

Статус: pending

## Цель

Перемещать variants атомарной парой transfer_out/transfer_in с document, actor и audit.

## Предполагаемые файлы

- `supabase/migrations/<new>_inventory_transfers.sql`
- `lib/contracts/inventory.ts`

## Зависимости

TASK-097.

## Критерии готовности

- Source stock проверяется и не становится отрицательным.
- Обе стороны движения создаются в одной transaction.
- Access к обоим stores проверяется server-side.

## Тесты

- SQL success/insufficient/access/idempotency tests.
- Balance reconciliation both stores.
- Concurrent transfer/sale test.

