# TASK-072 — Добавить Owner Reports UI

Статус: pending

## Цель

Собрать metrics, period, breakdown и inventory reports в отдельный Owner-only раздел.

## Предполагаемые файлы

- `features/reports/ui/reports-dashboard.tsx`
- `app/(dashboard)/reports/page.tsx`
- `components/layout/app-nav.tsx`

## Зависимости

TASK-052, TASK-068, TASK-069, TASK-070, TASK-071.

## Критерии готовности

- Owner видит summary и drill-down; Seller route запрещён.
- Loading/empty/error states не показывают mock values в live.
- Mobile layout сохраняет читаемость таблиц/charts.

## Тесты

- Component role/filter states.
- Playwright report navigation.
- Desktop/mobile visual QA.

