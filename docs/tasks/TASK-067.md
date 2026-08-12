# TASK-067 — Добавить Seller sales history filters

Статус: pending

## Цель

Дать Owner/Seller фильтрацию history по продавцу, status и business period без отдельной shift entity.

## Предполагаемые файлы

- `features/sales/model/sale-history-filters.ts`
- `features/sales/ui/sale-history.tsx`

## Зависимости

TASK-062.

## Критерии готовности

- Owner фильтрует Sellers своего store; Seller scope соблюдён.
- Wednesday–Tuesday week вычисляется корректно.
- Filters отражаются в URL/query state.

## Тесты

- Date/filter unit tests.
- Role filter component tests.
- Direct-link browser test.

