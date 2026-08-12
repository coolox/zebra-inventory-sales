# TASK-015 — Добавить e2e mixed-currency sale в demo

Статус: COMPLETED

## Цель

Автоматизировать пользовательский сценарий двух строк одной модели с разными валютами.

## Предполагаемые файлы

- `e2e/sales.spec.ts`

## Зависимости

TASK-003, TASK-007, TASK-014.

## Критерии готовности

- Тест создаёт корзину EUR + USD и подтверждает ровно две позиции.
- Проверяет success toast, stock delta и отсутствие третьей позиции.
- Работает в desktop и mobile проектах Playwright.

## Тесты

- Targeted Playwright sales suite.
- Полный demo smoke suite.

## Прогресс

- 2026-08-10: добавлен `e2e/sales.spec.ts` для одного variant `TR-07` двумя самостоятельными sale lines: 100 EUR и 120 USD.
- Тест проверяет ровно две позиции в Current sale, enabled `Sell 2 items`, success toast, stock 2 → 0 и отсутствие sale из трёх items.
- Targeted suite проходит в desktop и mobile; полный Playwright demo suite: 4/4 PASS.
