# TASK-057 — Описать sales/payments API contracts

Статус: pending

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

