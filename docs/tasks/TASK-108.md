# TASK-108 — Добавить frontend-модель общей цены sale

Статус: COMPLETED

## Цель

Расширить типы и чистые расчёты Sale Flow режимом `Total sale price`, не меняя интерфейс формы.

## Предполагаемые файлы

- `features/sales/model/types.ts`
- `features/sales/model/payments.ts`
- `features/sales/model/payments.test.ts`
- `features/sales/data/confirm-live-sale.ts`
- `docs/tasks/TASK-108.md`

## Зависимости

TASK-107.

## Критерии готовности

- Draft явно хранит pricing mode независимо от payment mode.
- `sale_total` считает total EUR из payment lines для любого числа товаров.
- Payload передаёт sale lines без искусственного распределения revenue.
- Текущий `per_item` payload остаётся совместимым.
- Проверка stock не зависит от способа оплаты.

## Тесты

- Unit tests матрицы per-item/total × single/mixed.
- Typecheck.

## Результат

- Добавлен pricing mode в frontend draft и live RPC payload.
- Общая цена вычисляется из single/mixed payment lines без фиктивных line prices.
- Demo и live read model сохраняют общий revenue; аналитическое распределение помечается как allocation.
