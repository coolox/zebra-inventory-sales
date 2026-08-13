# TASK-078 — Добавить CI pipeline

Статус: in_progress

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

## Выполнено

- Добавлен GitHub Actions workflow для `push` и `pull_request`, не требующий production/staging secrets.
- Frontend job проверяет production TypeScript build, unit/component suite и Playwright desktop/tablet/mobile smoke.
- Database job запускает pinned local Supabase CLI, применяет migrations на чистой базе, выполняет pgTAP/RLS suite и отдельный clean-run concurrency harness.
- Stateful demo Playwright scenarios намеренно запускаются одним worker: это сохраняет проверку всех viewport'ов и исключает взаимное влияние localStorage сценариев.
- Локально подтверждено, что failing smoke command возвращает non-zero; после стабилизации selectors/hydration ожидания полный suite проходит.

## Remote verification (2026-08-13)

- Workflow успешно опубликован в ветке `review/task-060-077`; GitHub Actions создал run `31716168276` для commit `671f3e4`.
- Run остановлен до запуска jobs (`Startup failure`): GitHub сообщает о failed recent account payments или недостаточном spending limit. Это billing block, а не ошибка workflow, migration или test.
- Предыдущий PAT blocker устранён: созданный scoped token позволил обновить `.github/workflows/ci.yml`.

## Ожидает внешнего действия

- Владелец GitHub account должен исправить Billing & plans / spending limit. Затем повторно запустить CI или сделать новый push и подтвердить первый зелёный run. До этого TASK остаётся `in_progress`.
