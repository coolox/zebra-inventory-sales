# TASK-011 — Покрыть Sale Flow component-тестами

Статус: COMPLETED

## Цель

Зафиксировать code → color → size → cart → payment → submit сценарий.

## Предполагаемые файлы

- `features/sales/ui/sale-flow.test.tsx`

## Зависимости

TASK-003, TASK-007, TASK-009.

## Критерии готовности

- Проверены picker, cart quantities, removal и submit payload.
- Проверены empty/out-of-stock/error states.
- Проверены English и Turkish основные labels.

## Тесты

- Targeted component suite.
- Полный unit/component suite.

## Результат

- Component-тесты покрывают picker → cart → payment → submit, пустую корзину, error state и ключевые Turkish labels.
