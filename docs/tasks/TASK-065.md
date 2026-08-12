# TASK-065 — Добавить атомарную exchange RPC

Статус: pending

## Цель

Оформлять exchange_in/exchange_out и доплату согласно утверждённой политике без денежного возврата.

## Предполагаемые файлы

- `supabase/migrations/<new>_sales_exchange.sql`
- `lib/contracts/sales.ts`

## Зависимости

TASK-005, TASK-063.

## Критерии готовности

- Exchange ссылается на исходную sale line.
- Возвращаемый stock восстанавливается, новый списывается атомарно.
- Доплата создаёт native payment lines; при более дешёвом товаре credit/refund не создаётся.
- Reason и audit обязательны.

## Тесты

- SQL tests expensive/cheaper/equal exchange.
- Insufficient new stock rollback.
- RLS/idempotency/audit tests.

