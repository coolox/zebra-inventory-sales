# TASK-110 — Покрыть общую цену sale regression-тестами

Статус: COMPLETED

## Цель

Закрепить полный пользовательский сценарий и не допустить повторной поломки multi-item, Mixed payment и stock validation.

## Предполагаемые файлы

- `features/sales/ui/sale-flow.test.tsx`
- `test/**`
- `docs/tasks/TASK-110.md`

## Зависимости

TASK-109.

## Критерии готовности

- Покрыты один и несколько товаров в обоих pricing modes.
- Покрыты single и mixed payments с одинаковыми и разными валютами.
- Проверены повторный variant, недостаточный stock, FX error и rollback UI.
- Sell count и payload совпадают с корзиной.

## Тесты

- `npm run test`.
- `npx tsc --noEmit`.
- `npm run build`.

## Результат

- Добавлены regression tests total-price single payment, multi-item EUR/USD mixed payment и live payload без фиктивных цен.
- 17 unit/component tests, TypeScript и production build проходят.
