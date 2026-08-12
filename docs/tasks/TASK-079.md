# TASK-079 — Развернуть отдельный staging frontend

Статус: pending

## Цель

Опубликовать Next.js staging на Vercel с привязкой только к staging Supabase.

## Предполагаемые файлы

- `vercel.json` при необходимости
- `.env.example`
- `docs/PROJECT_STATUS.md`
- `docs/tasks/TASK-079.md`

## Зависимости

TASK-040, TASK-061, TASK-078.

## Критерии готовности

- Staging URL доступен и не использует production resources.
- Environment variables настроены вне git.
- Auth callbacks и protected routes работают.

## Тесты

- Staging health/auth smoke.
- Live workspace no-mock check.
- Desktop/mobile Playwright smoke against staging.

