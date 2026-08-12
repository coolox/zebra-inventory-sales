# TASK-078 — Добавить CI pipeline

Статус: pending

## Цель

Автоматически проверять types, unit/component/e2e smoke, migrations и production build.

## Предполагаемые файлы

- `.github/workflows/ci.yml`
- `package.json`
- `supabase/config.toml`

## Зависимости

TASK-013, TASK-014, TASK-044, TASK-077.

## Критерии готовности

- CI работает на pull request/push без production secrets.
- Каждый тип проверки имеет отдельный понятный step.
- Failed migration/test блокирует green status.

## Тесты

- Local equivalents всех CI commands.
- One controlled failing check confirms pipeline failure.
- Green clean run.

