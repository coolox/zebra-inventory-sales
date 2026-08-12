# TASK-102 — Считать заполненную следующую позицию в multi-item sale

Статус: COMPLETED

## Цель

После `Add another item` сразу включать полностью заполненную следующую позицию в Current sale, кнопку Sell и payload, не требуя ещё одного нажатия Add another item.

## Предполагаемые файлы

- `features/sales/ui/sale-flow.tsx`
- `features/sales/ui/sale-flow.test.tsx`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-101.

## Критерии готовности

- После первой сохранённой позиции и заполнения второй Current sale и Sell показывают 2 items.
- Подтверждение отправляет обе позиции.
- Незавершённая следующая позиция не увеличивает количество и не отправляется.

## Тесты

- Component tests complete и incomplete second picker.
- `npm run test`, `npx tsc --noEmit`, `npm run build`.

## Результат

- Заполненная следующая позиция сразу отображается в Current sale, увеличивает счётчик и входит в payload подтверждения.
- Незавершённый picker по-прежнему не влияет на sale.
