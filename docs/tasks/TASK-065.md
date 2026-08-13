# TASK-065 — Добавить атомарную exchange RPC

Статус: COMPLETED

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

## Выполнено

- Добавлены `sale_exchanges` и `sale_exchange_payments`: exchange хранит immutable source/replacement price+FX snapshots, reason, actor и idempotency key; top-up payment хранит native amount/currency/FX.
- `exchange_sale_line` разрешён активному Seller/Owner только в своём store. Он блокирует source line и variant balances, возвращает `exchange_in`, списывает `exchange_out` и создаёт audit в одной transaction.
- Более дорогой replacement требует точную доплату; equal/cheaper требует пустой payment array и никогда не создаёт refund/credit. Total-price source lines намеренно отклоняются: у них нет достоверной per-line price snapshot для расчёта разницы.
- Полный local pgTAP: 10 files / 114 checks PASS, включая expensive/equal/cheaper, insufficient stock rollback, mandatory reason, RLS, idempotency и audit. `npx tsc --noEmit`, targeted contract test, `npm run build` и `git diff --check` проходят. Staging/production не изменялись.
