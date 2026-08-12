# TASK-101 — Упростить Sale Flow и добавить Mixed payment toggle

Статус: COMPLETED

## Цель

Сделать обычную продажу понятным однострочным сценарием и раскрывать несколько payment lines только по явному чекбоксу `Mixed payment`.

## Предполагаемые файлы

- `features/sales/ui/sale-flow.tsx`
- `features/sales/ui/payment-editor.tsx`
- `features/sales/ui/sale-flow.test.tsx`
- `docs/DECISIONS.md`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-002, TASK-006, TASK-007, TASK-008, TASK-011.

## Критерии готовности

- Обычная продажа ведёт от товара, суммы и валюты к выбору Cash/Card/Bank transfer и подтверждению без добавления товара в корзину.
- Чекбокс `Mixed payment` отображается до подтверждения и по умолчанию выключен.
- После включения чекбокса виден редактор нескольких payment lines; одну строку можно добавить, изменить и удалить.
- `Add another item` не требуется для mixed payment и остаётся только для отдельного multi-item sale сценария, если такой сценарий сохранён.
- English и Turkish подписи понятны и соответствуют выбранному режиму.

## Тесты

- Component test: обычная sale отправляет одну payment line выбранного метода.
- Component test: Mixed payment раскрывает вторую строку и отправляет обе строки.
- Component test: несбалансированная mixed payment не подтверждается.
- `npm run test`, `npx tsc --noEmit`, `npm run build`.

## Результат

- Обычная sale отправляет выбранный товар напрямую с одной явно выбранной Cash/Card/Bank transfer payment line.
- `Mixed payment` по умолчанию выключен; только после его включения появляется редактор нескольких payment lines.
- Component-тесты покрывают normal sale, включение/изменение/удаление mixed payment lines, несбалансированную оплату, Turkish labels и незавершённый picker.
