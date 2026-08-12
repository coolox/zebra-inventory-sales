# TASK-050 — Вынести Activity Feed feature

Статус: pending

## Цель

Отделить recent/all activity rendering, currency formatting и pagination от dashboard.

## Предполагаемые файлы

- `features/activity/ui/activity-feed.tsx`
- `features/activity/model/format-activity.ts`
- `app/page.tsx`

## Зависимости

TASK-008, TASK-047.

## Критерии готовности

- Original currency breakdown и EUR conversion label сохранены.
- Empty/error states локализованы.
- Compact и full variants переиспользуют один component.

## Тесты

- Formatting unit tests.
- Component compact/full/empty tests.
- Build.

