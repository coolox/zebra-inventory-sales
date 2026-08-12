# TASK-031 — Добавить аудируемую inventory adjustment

Статус: COMPLETED

## Цель

Позволить Owner корректировать остаток через отдельное движение с обязательной причиной.

## Предполагаемые файлы

- `supabase/migrations/<new>_inventory_adjustments.sql`
- `features/inventory/data/confirm-adjustment.ts`
- `features/inventory/ui/adjustment-form.tsx`

## Зависимости

TASK-029.

## Критерии готовности

- Adjustment не редактирует balance напрямую.
- Reason, actor, timestamp и audit entry обязательны.
- Seller не может выполнять Owner-only adjustment.

## Тесты

- SQL atomicity/RLS tests.
- Form validation tests.
- Staging stock reconciliation smoke-test.

## Подготовленный результат

- Добавлена Owner-only, idempotent RPC `confirm_inventory_adjustment`: она блокирует variant transaction lock, считает balance из ledger, запрещает отрицательный итог и добавляет только `adjustment` movement с actor/reason/timestamp.
- В одном transaction записывается `inventory.adjusted` audit entry со stock before/after; Seller и cross-store variant отклоняются на сервере.
- Owner UI доступен из выбранного color/size variant, требует signed integer и reason, не допускает отрицательный demo balance. Form tests проходят.

## Проверка

- `npm run test` — 66/66 passed.
- `npx tsc --noEmit`, `npm run build` и `git diff --check` — passed.
- Добавлен pgTAP atomicity/RLS/idempotency regression test.
- 2026-08-11: migration применена точечно в `zebra-retail-staging` через SQL Editor (CLI `db push` намеренно не использовался, так как он включал бы старые неподтверждённые migrations). Smoke выполнил Owner RPC `+1` и компенсирующий `-1`: final stock вернулся к 3, создано 2 adjustment movements и 2 audit records. Production не изменялся.
