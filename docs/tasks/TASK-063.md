# TASK-063 — Добавить атомарную cancellation RPC

Статус: pending

## Цель

Отменять ошибочную confirmed sale через reversal movements и audit без удаления истории.

## Предполагаемые файлы

- `supabase/migrations/<new>_sale_cancellation.sql`
- `lib/contracts/sales.ts`

## Зависимости

TASK-012, TASK-057, TASK-062.

## Критерии готовности

- Seller может отменить разрешённую sale с обязательной reason.
- Sale становится cancelled, stock восстанавливается, payments получают reversal status.
- Повторная cancellation идемпотентна; cancelled sale нельзя отменить повторно.

## Тесты

- SQL atomicity/idempotency/RLS tests.
- Stock/payment/audit reconciliation.
- Concurrent cancellation guard test.

