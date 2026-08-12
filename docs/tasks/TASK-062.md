# TASK-062 — Добавить Sales History view

Статус: pending

## Цель

Показать store-scoped список sales с lines, seller, payments, status и snapshots.

## Предполагаемые файлы

- `features/sales/data/load-sale-history.ts`
- `features/sales/ui/sale-history.tsx`
- `app/(dashboard)/sales/page.tsx`

## Зависимости

TASK-008, TASK-052, TASK-057.

## Критерии готовности

- History paginated и не пересчитывает historical FX.
- Owner/Seller видят только разрешённый store.
- Empty/error/detail states локализованы.

## Тесты

- Data mapper/pagination tests.
- RLS integration test.
- Component detail dialog tests.

