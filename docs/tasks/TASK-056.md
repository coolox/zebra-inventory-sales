# TASK-056 — Описать catalog/receipt API contracts

Статус: pending

## Цель

Зафиксировать DTO и commands каталога, фото, receipt и inventory movements независимо от RPC transport.

## Предполагаемые файлы

- `lib/contracts/catalog.ts`
- `lib/contracts/receipts.ts`
- `lib/contracts/inventory.ts`

## Зависимости

TASK-018, TASK-023, TASK-029.

## Критерии готовности

- Read models отделены от mutation commands.
- Currency, barcode, variant identity и idempotency заданы явно.
- UI features не зависят от raw database rows.

## Тесты

- Mapper/contract fixtures.
- Typecheck.
- No direct Supabase row types in UI source scan.

