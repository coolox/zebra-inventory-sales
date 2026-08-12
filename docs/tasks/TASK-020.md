# TASK-020 — Покрыть receipt feature тестами

Статус: completed

## Цель

Зафиксировать matrix input, merging variants, validation и live payload.

## Предполагаемые файлы

- `features/receipts/**/*.test.ts`
- `features/receipts/**/*.test.tsx`

## Зависимости

TASK-009, TASK-016, TASK-017, TASK-018.

## Критерии готовности

- Покрыты новая модель, существующая модель и несколько size/color lines.
- Покрыты invalid quantities/cost/currency.
- Покрыт submit payload и error display.

## Тесты

- Targeted receipts suite.
- Полный unit/component suite.
