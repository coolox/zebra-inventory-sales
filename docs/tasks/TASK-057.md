# TASK-057 — Описать sales/payments API contracts

Статус: completed

## Цель

Зафиксировать sale draft, payment lines, snapshots, cancellation и exchange DTO.

## Предполагаемые файлы

- `lib/contracts/sales.ts`
- `features/sales/model/types.ts`

## Зависимости

TASK-005, TASK-006.

## Критерии готовности

- Contract поддерживает repeated variant priced lines и native payments.
- Money units/tolerance/idempotency описаны.
- Будущие cancellation/exchange не требуют ломать sale read model.

## Тесты

- Type fixtures valid/invalid payloads.
- Mapper unit tests.
- Typecheck.

## Результат

- Sale contract поддерживает repeated variant lines с разными price/currency, native payment lines и явный idempotency key.
- Зафиксированы decimal major money units и EUR reconciliation tolerance €0.01.
- Добавлен совместимый lifecycle DTO для будущих cancellation/exchange без изменения sale read model.
- Проверены TypeScript и valid/invalid mapper fixtures.
