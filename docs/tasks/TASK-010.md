# TASK-010 — Покрыть demo sale calculation unit-тестами

Статус: COMPLETED

## Цель

Зафиксировать расчёты revenue, margin, stock и атомарный отказ demo sale.

## Предполагаемые файлы

- `features/sales/model/create-demo-sale.test.ts`

## Зависимости

TASK-009.

## Критерии готовности

- Покрыты single/multi-item и mixed-currency calculations.
- Покрыт один variant несколькими строками.
- Недостаточный stock не создаёт частичный результат.

## Тесты

- Запуск targeted Vitest suite.
- Полный unit test suite.

## Результат

- Unit-тесты фиксируют single/multi-item mixed-currency расчёты, повторные строки одного variant и atomic failure при недостаточном stock.
