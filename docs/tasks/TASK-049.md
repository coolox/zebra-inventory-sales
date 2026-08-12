# TASK-049 — Вынести Inventory list feature

Статус: pending

## Цель

Перенести search, pagination, table/cards и product selection из dashboard page.

## Предполагаемые файлы

- `features/inventory/ui/inventory-list.tsx`
- `features/inventory/model/filter-products.ts`
- `app/page.tsx`

## Зависимости

TASK-023, TASK-047.

## Критерии готовности

- Search/page reset логика локальна feature.
- Desktop table и mobile presentation используют один data contract.
- Product Card открывается через callback.

## Тесты

- Filter/pagination unit tests.
- Component empty/search/page tests.
- Responsive smoke-test.

