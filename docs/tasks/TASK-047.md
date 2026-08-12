# TASK-047 — Вынести dashboard shell

Статус: COMPLETED

## Цель

Отделить navigation, header, modal host и workspace chrome от business panels.

## Предполагаемые файлы

- `components/layout/dashboard-shell.tsx`
- `components/layout/app-header.tsx`
- `components/layout/app-nav.tsx`
- `app/page.tsx`

## Зависимости

TASK-046.

## Критерии готовности

- Shell не вычисляет sales/inventory metrics.
- Desktop/mobile navigation behavior сохранено.
- Role/locale/theme controls передаются явными props.

## Тесты

- Component navigation tests.
- `npx tsc --noEmit`.
- `npm run build`.

## Результат

- `DashboardShell`, `AppHeader` и `AppNav` получают только composition/navigation props и не вычисляют business metrics.
- Role, locale/theme/session controls передаются в `AppHeader` как явный controls slot; mobile close и navigation идут через callbacks.
- TypeScript и 89 unit/component tests проходят.
