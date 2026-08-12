# TASK-032 — Добавить workflow начальной инвентаризации

Статус: COMPLETED

## Цель

Создать подтверждаемый документ начального пересчёта stock для чистого запуска магазина.

## Предполагаемые файлы

- `supabase/migrations/<new>_inventory_counts.sql`
- `features/inventory-counts/**`

## Зависимости

TASK-031.

## Критерии готовности

- Count имеет draft/confirmed status и строки variants.
- Confirm создаёт только adjustment movements в одной transaction.
- Повторное подтверждение идемпотентно.

## Тесты

- SQL draft/confirm/idempotency tests.
- Component form tests.
- Staging count smoke-test.

## Реализация

- Добавлена migration `20260811120000_inventory_counts.sql`: draft/confirmed count documents, count lines, Owner RLS, audit event и идемпотентный transaction-confirm.
- Добавлены live RPC client и responsive Owner count form; в demo count меняет только локальный balance, а live mode использует RPC.
- Migration применена на staging 2026-08-11; владелец подтвердил UI-проверку сценария.
