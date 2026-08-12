# TASK-056 — Описать catalog/receipt API contracts

Статус: completed

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

## Результат

- Добавлены transport-independent catalog, receipt и inventory contracts.
- Receipt command явно задаёт store, model, color/size quantities, native currency и idempotency key до RPC mapping.
- Catalog и movement read adapters возвращают detached DTO, а UI продолжает работать только с normalized models.
- Проверены type fixtures, TypeScript, полный unit/component suite и production build.
