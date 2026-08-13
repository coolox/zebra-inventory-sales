# TASK-063 — Добавить атомарную cancellation RPC

Статус: COMPLETED

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

## Выполнено

- Добавлена migration `20260813010000_sale_cancellation.sql`: `cancel_sale` блокирует sale row, сохраняет исходную sale/line/payment историю, создаёт точные positive `sale_cancellation` movements, отменяет payment snapshots и пишет audit reason.
- Активный Seller текущего store может отменить confirmed sale только с непустой reason. Cross-store/anonymous вызовы отклоняются.
- Повторный вызов после row lock возвращает `idempotent_replay: true`, без второго reversal movement или audit record.
- Локальный Supabase pgTAP suite проходит: 9 files / 97 checks, включая новую `026_sale_cancellation_test.sql` (atomicity, payment/stock/audit reconciliation, RLS и replay guard). Production и staging не изменялись.
