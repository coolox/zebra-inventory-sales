# TASK-016 — Вынести receipt draft и demo calculation в feature

Статус: COMPLETED

## Цель

Убрать receipt types и demo stock mutation из dashboard composition.

## Предполагаемые файлы

- `features/receipts/model/types.ts`
- `features/receipts/model/create-demo-receipt.ts`
- `app/page.tsx`

## Зависимости

TASK-009.

## Критерии готовности

- Demo receipt calculation является чистой функцией.
- Существующие variants объединяются, новые создаются предсказуемо.
- `app/page.tsx` только применяет результат к workspace state.

## Тесты

- Unit tests merge/new variant/invalid quantity.
- `npx tsc --noEmit`.
- `npm run build`.

## Прогресс

- 2026-08-10: `ReceiptDraft` и чистая `createDemoReceipt` перенесены в `features/receipts/model`.
- Функция сначала валидирует все quantities, затем атомарно объединяет существующий clothing variant или предсказуемо создаёт новый; dashboard применяет только её products/activity result.
- Добавлены tests merge/new variant/invalid quantity. `npx tsc --noEmit`, `npm test` (22/22) и `npm run build` проходят.
