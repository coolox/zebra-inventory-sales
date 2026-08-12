# TASK-083 — Создать production Supabase и Vercel projects

Статус: pending

## Цель

Подготовить изолированные production resources без загрузки реальных данных до approval gate.

## Предполагаемые файлы

- `.env.example`
- `docs/operations/PRODUCTION_SETUP.md`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-078, TASK-082.

## Критерии готовности

- Production отделён от staging project IDs/resources.
- Secrets заданы только через hosted environment management.
- Data API/RLS defaults соответствуют decisions.
- Приложение ещё не запущено для pilot users без отдельного launch step.

## Тесты

- Environment isolation checklist.
- No secrets/git scan.
- Empty production health check.

