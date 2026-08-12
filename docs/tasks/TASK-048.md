# TASK-048 — Вынести Overview feature

Статус: COMPLETED

## Цель

Перенести KPI, chart, seller ranking и goal composition из page в отдельный read-only feature.

## Предполагаемые файлы

- `features/overview/ui/overview.tsx`
- `features/overview/model/metrics.ts`
- `app/page.tsx`

## Зависимости

TASK-047.

## Критерии готовности

- Metrics являются чистыми selectors.
- Owner/Seller visibility сохранена.
- Empty live data не подменяется mocks.

## Тесты

- Unit metric selectors.
- Component role/empty states.
- Build.

## Результат

- KPI, chart, Seller ranking и goal composition вынесены в read-only `Overview`; page передаёт нормализованные data/callback props.
- Selectors остаются чистыми; empty arrays отображают zero/empty state без mock substitution.
- Owner/Seller component visibility покрыта тестами.
