# TASK-066 — Добавить Exchange UI

Статус: COMPLETED

## Цель

Провести Seller через исходную sale line, новый variant, разницу и payment confirmation.

## Предполагаемые файлы

- `features/exchanges/ui/exchange-flow.tsx`
- `features/exchanges/data/confirm-exchange.ts`
- `app/(dashboard)/sales/page.tsx`

## Зависимости

TASK-062, TASK-065.

## Критерии готовности

- Picker показывает только доступные variants.
- UI явно объясняет доплату или отсутствие возврата разницы.
- После success обновляются sale history, stock и activity.

## Тесты

- Component tests three price-difference cases.
- Staging exchange smoke-test.
- Mobile portrait flow.

## Выполнено

- Exchange action добавлен в detail confirmed per-item sale line. Picker показывает только in-stock variants, source line identity передаётся в RPC отдельно от variant identity.
- UI рассчитывает доплату по сохранённой EUR цене source line; для equal/cheaper replacement явно показывает отсутствие refund/credit. Доплата подтверждается payment method и supported native currency.
- После success live refreshes workspace; demo обновляет stock и activity. Total-price sale lines намеренно не получают action: у них нет точного per-line price snapshot.
- Component tests покрывают expensive/equal/cheaper price difference; full frontend suite — 121/121, TypeScript/build проходят. Mobile dialog используется через общий responsive Modal.
- Migration `20260813020000_sales_exchange.sql` применена на staging. Smoke с `TASK-066 staging smoke` подтвердил €10 top-up, paired `exchange_in/exchange_out` movements, native EUR payment snapshot, audit и idempotent replay. В staging не было другого in-stock variant, поэтому smoke использовал тот же variant исключительно для проверки атомарного ledger; UI этот вариант пользователю не предлагает. Production не изменялся.
