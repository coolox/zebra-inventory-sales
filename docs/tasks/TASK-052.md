# TASK-052 — Добавить routing разделов dashboard

Статус: pending

## Цель

Заменить anchor-only navigation устойчивыми route boundaries для overview, inventory, sales, team и settings.

## Предполагаемые файлы

- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/**/page.tsx`
- `components/layout/app-nav.tsx`
- `middleware.ts`

## Зависимости

TASK-047, TASK-048, TASK-049, TASK-050, TASK-051.

## Критерии готовности

- Каждый раздел имеет стабильный URL и общий shell.
- Auth/membership guard защищает все routes.
- Mobile navigation закрывается после перехода.
- Deep link не теряет workspace state.

## Тесты

- Route navigation component tests.
- Playwright direct-link/auth redirect tests.
- Build route manifest review.

