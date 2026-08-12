# TASK-012 — Добавить локальный SQL integration harness

Статус: COMPLETED

## Цель

Создать воспроизводимую среду проверки Supabase migrations и RPC без production данных.

## Предполагаемые файлы

- `package.json`
- `supabase/config.toml`
- `supabase/tests/**`
- `supabase/README.md`

## Зависимости

Нет.

## Критерии готовности

- Локальная база поднимается утверждённой командой.
- Все migrations применяются с чистого состояния.
- Test fixtures не содержат secrets или персональные данные.

## Тесты

- Fresh database migration run.
- Baseline SQL test command.
- Reset и повторный прогон.

## Прогресс

- 2026-08-10: добавлены `supabase/config.toml`, pinned CLI scripts и self-contained pgTAP baseline без fixtures, secrets или персональных данных.
- 2026-08-10: Docker Desktop запущен; `npm run supabase:start` применил все migrations с чистой базы. `npm run supabase:verify` успешно пройден дважды: reset, полный migration run и 7/7 pgTAP baseline checks — PASS.
