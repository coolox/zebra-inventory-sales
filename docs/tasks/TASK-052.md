# TASK-052 — Добавить routing разделов dashboard

Статус: completed

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

## Результат

- Добавлены стабильные URL `/inventory`, `/sales`, `/team` и `/settings`; каждый отображает общий dashboard workspace.
- Навигация обновляет URL, закрывает mobile drawer и сохраняет workspace state при прямом открытии раздела.
- Middleware продолжает применяться ко всем dashboard routes; отдельная auth redirect проверка остаётся частью backend auth coverage.
- Проверены TypeScript, 93 unit/component теста, production build и 12 Playwright smoke checks на desktop/tablet/mobile.
