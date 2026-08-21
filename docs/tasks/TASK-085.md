# TASK-085 — Провести production migration rehearsal

Статус: COMPLETED

## Изменение порядка — 2026-08-16

Owner явно выбрал запуск TASK-085 до финальной delivery acceptance TASK-084. Это
безопасно: Auth/SMTP/redirect/template configuration TASK-084 уже сохранена, а
оставшиеся Owner/Seller/unknown/reused-link tests требуют controlled production
schema и identities, которые создаёт именно этот rehearsal. TASK-085 не подключает
Git, не запускает приложение и не создаёт pilot data; после bootstrap acceptance
TASK-084 выполняется до TASK-150.

## Текущее состояние — 2026-08-16

- Clean local rehearsal passed: all 29 migrations applied in order and all 14 pgTAP
  files / 175 assertions passed.
- Production dashboard confirms the project has no migration history yet. Supabase
  provides the supported CLI path `link → db push`; manual SQL Editor application
  is intentionally rejected because it would bypass `supabase_migrations` history.
- Owner must enter the production database password interactively into their local
  CLI `supabase link` prompt. The password is never requested in chat, read or
  stored by the agent. After a successful link, the agent can run dry-run, apply the
  migrations, verify remote history and continue the rollback/re-apply smoke.

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

## Результат — 2026-08-16

TASK-085 завершена.

- Owner linked the empty production project through the interactive CLI password
  prompt. A dry-run listed exactly 29 repository migrations, no seed and no roles;
  `db push` then applied all 29 and final dry-run reported `upToDate`.
- Fresh local reset applied the same chain and passed 14 pgTAP files / 175 assertions.
  Post-migration concurrency (4 scenarios) and 26-case security/capacity smoke also
  passed; slowest five-user sale was 361 ms under the 5 s pilot threshold.
- [MIGRATION_REHEARSAL.md](../operations/MIGRATION_REHEARSAL.md) documents the
  UUID-free Owner/Zebra Boutique bootstrap and forward-only rollback/recovery rule.
  No Auth identity, Seller, seed, catalog, stock, image, Git deployment or pilot user
  was created by this task.
- Production delivery acceptance remaining in TASK-084 is intentionally deferred
  until controlled identities and production callback deployment exist, before
  TASK-150.
