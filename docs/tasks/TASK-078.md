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

## Ожидает внешнего действия

- Текущий GitHub Personal Access Token не имеет scope `workflow`, поэтому GitHub отклонил push нового `.github/workflows/ci.yml`. После выдачи этого scope нужно pushнуть commit и подтвердить первый зелёный GitHub Actions run.
