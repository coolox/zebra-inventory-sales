# TASK-129 — Интегрировать label cart с обычным подтверждением sale

Статус: pending

## Цель

Передавать подтверждённые label-derived cart lines в существующий pricing/payment flow без отдельного или ослабленного sale RPC.

## Предполагаемые файлы

- `features/sales/ui/sale-flow.tsx`
- `features/sales/model/**`
- `features/sales/data/confirm-live-sale.ts`
- `features/sale-labels/data/**`

## Зависимости

TASK-110, TASK-116, TASK-128.

## Критерии готовности

- Manual и label-derived items могут находиться в одной cart.
- Per-item/Total sale price, single/mixed payment и FX validation работают без изменений правил.
- Label source metadata сохраняется только как audit/reference metadata и не заменяет product/variant UUID.
- Финальный Sell вызывает тот же атомарный stock/payment/audit RPC и повторно проверяет остаток.
- После success временные label drafts закрываются по retention policy; при failure cart/review остаются для исправления.

## Тесты

- Mixed manual/label cart unit/component tests.
- Per-item/Total and single/mixed payment regression.
- Concurrent sell-out rollback и no-partial-sale integration test.

