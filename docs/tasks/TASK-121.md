# TASK-121 — Распределить invoice quantity по color/size variants

Статус: pending

## Цель

После распознавания строки накладной дать сотруднику разложить ожидаемое количество по физически полученным цветам и размерам перед подтверждением.

## Предполагаемые файлы

- `features/receipt-extraction/ui/variant-reconciliation.tsx`
- `features/receipts/model/receipt-reconciliation.ts`
- `features/receipts/ui/receive-flow.tsx`

## Зависимости

TASK-118, TASK-120.

## Критерии готовности

- Каждая invoice line показывает expected quantity, distributed quantity и remaining difference.
- Color → sizes → quantity matrix поддерживает существующие и новые variants.
- Barcode вводится/сканируется только как optional поле конкретного variant и может остаться пустым.
- Повторное сканирование известного variant barcode может увеличивать его count, но ручной flow остаётся полностью доступен.
- Confirm блокируется при расхождении expected/distributed quantity либо требует явную discrepancy reason согласно политике.

## Тесты

- Exact reconciliation, undercount, overcount and accepted discrepancy cases.
- Multiple colors/sizes component tests на desktop/mobile.
- Receipt без единого barcode проходит полностью.

