# TASK-007 — Добавить редактор mixed payments в Sale Flow

Статус: COMPLETED

## Цель

Позволить продавцу разбить оплату на несколько способов и валют с понятным остатком к оплате.

## Предполагаемые файлы

- `features/sales/ui/payment-editor.tsx`
- `features/sales/ui/sale-flow.tsx`

## Зависимости

TASK-006.

## Критерии готовности

- Можно добавить, изменить и удалить payment lines.
- UI показывает total, paid и remaining в EUR preview.
- Нельзя подтвердить несбалансированную оплату.
- Интерфейс адаптивен для mobile portrait.

## Тесты

- Component tests add/remove/edit payment line.
- Component tests balanced и mismatched states.
- Keyboard and touch smoke-test.

## Результат

- В Sale Flow добавлен адаптивный редактор payment lines: добавить, изменить и удалить строку; total, paid и remaining отображаются в EUR.
- Несбалансированную или пустую оплату отправить нельзя; component-тесты проверяют add/edit и balanced/mismatched state.
