# TASK-034 — Добавить low-stock threshold и историю внимания

Статус: COMPLETED

## Цель

Заменить фиксированное `stock <= 2` на store/model policy и показывать воспроизводимую историю low-stock.

## Предполагаемые файлы

- `supabase/migrations/<new>_low_stock_thresholds.sql`
- `features/inventory/data/load-low-stock.ts`
- `components/low-stock-carousel.tsx`

## Зависимости

TASK-029.

## Критерии готовности

- Owner задаёт threshold, Seller не меняет его.
- Low-stock query использует реальный balance.
- Carousel безопасно обрабатывает пустой/изменившийся список.

## Тесты

- Threshold/RLS SQL tests.
- Carousel component tests.
- Live reload smoke-test.

## Реализация

- Добавлена store default policy и model override, Owner-only threshold RPC, audited action и store-scoped real-balance `load_low_stock` query.
- Product Card позволяет Owner изменить model threshold; carousel использует model threshold или store default `2`, корректно сбрасывая current item при изменении списка.
- Migration применена на staging 2026-08-11; владелец подтвердил UI-проверку, включая сохранение threshold.
