# TASK-085 — Провести production migration rehearsal

Статус: pending

## Цель

Применить полный migration chain к чистой production-like базе и проверить rollback до реального запуска.

## Предполагаемые файлы

- `supabase/README.md`
- `docs/operations/MIGRATION_REHEARSAL.md`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-083, TASK-084.

## Критерии готовности

- Migrations применяются с нуля в правильном порядке.
- Bootstrap Owner и seed Zebra Boutique документированы без concrete UUID.
- Rollback/recovery выполнен на rehearsal environment.

## Тесты

- Fresh migration run.
- RLS/RPC full suite.
- Rollback and re-apply smoke.

