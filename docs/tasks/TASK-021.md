# TASK-021 — Применить receipt business-date migration на staging

Статус: completed

## Результат staging-проверки

- Wrapper migration подтверждена на `zebra-retail-staging`: RPC использует store timezone, internal function существует, timezone Zebra Boutique — `Europe/Istanbul`.
- Boundary fixture сохранил EUR receipt в `2026-08-09 23:30 +03` и USD receipt в `2026-08-10 00:30 +03`.
- Подтверждены 2 receipt, 2 lines, 2 inventory movements и 2 audit records; USD FX snapshot соответствует Istanbul business date `2026-08-10`.
- Повтор USD-вызова с тем же ключом вернул `idempotent_replay = true` и не создал дубликаты.
- Production не изменялся. Ранние migrations применялись через SQL Editor и поэтому не отражены в CLI migration history.

## Цель

Устранить UTC-date FX lookup после полуночи и подтвердить реальную non-EUR приёмку.

## Предполагаемые файлы

- `supabase/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/tasks/TASK-021.md`

## Зависимости

TASK-017.

## Критерии готовности

- `20260809010000_receipt_business_date.sql` применена в staging.
- EUR и одна non-EUR receipt сохраняются.
- Business date соответствует Europe/Istanbul.

## Тесты

- Manual staging receipt до/после midnight boundary fixture.
- Проверка receipt lines, movements и audit.
- Повторный idempotency smoke-test.
