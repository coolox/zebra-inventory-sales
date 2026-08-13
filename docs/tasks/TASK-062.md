# TASK-062 — Добавить Sales History view

Статус: COMPLETED

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

## Выполнено

- Добавлен store-scoped Sales History с pagination, empty state и detail dialog; Owner видит текущий store, Seller — только свои строки текущего store.
- Detail показывает seller, status, product/code/size и original-currency payment snapshot. Historical EUR и FX snapshots читаются из sale records и не пересчитываются по текущему курсу.
- Live adapter опирается на существующие `sales`, `sale_lines` и `sale_payments` RLS policies; existing pgTAP RLS regression уже подтверждает Store A-only read для Seller/Owner и denial cross-store payment/line reads.
- Добавлены mapper/pagination и component detail tests, а также browser smoke для `/sales` на desktop/tablet/mobile.
