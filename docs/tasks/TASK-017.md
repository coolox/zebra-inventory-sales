# TASK-017 — Вынести live receipt mutation и error mapping

Статус: COMPLETED

## Цель

Перенести прямой вызов `confirm_inventory_receipt` и интерпретацию ошибок из `app/page.tsx`.

## Предполагаемые файлы

- `features/receipts/data/confirm-live-receipt.ts`
- `features/receipts/model/receipt-errors.ts`
- `app/page.tsx`

## Зависимости

TASK-016.

## Критерии готовности

- Dashboard не знает RPC payload details.
- Ошибки access, FX, invalid data и duplicate request локализованы.
- Refresh workspace выполняется только после success.

## Тесты

- Unit tests payload/error mapping.
- `npx tsc --noEmit`.
- `npm run build`.

## Прогресс

- 2026-08-10: `confirm_inventory_receipt` payload и mapping access/FX/validation/duplicate ошибок перенесены в `features/receipts`.
- `app/page.tsx` вызывает feature mutation и refreshes workspace только после её successful completion; Receive Flow использует общий localized error mapping.
- Добавлены unit tests RPC payload и Turkish FX error. `npx tsc --noEmit`, `npm test` (24/24) и `npm run build` проходят.
