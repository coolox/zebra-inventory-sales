# TASK-096 — Проверить Telegram idempotency и consistency

Статус: pending

## Цель

Защитить повторные Telegram updates и доказать одинаковые balances/reporting для web и bot.

## Предполагаемые файлы

- `integrations/telegram/**/tests`
- `supabase/tests/telegram_consistency_test.sql`

## Зависимости

TASK-095.

## Критерии готовности

- Duplicate update ID не создаёт вторую operation.
- Web и bot видят один stock после каждой операции.
- Failure/retry не оставляет partial records.

## Тесты

- Repeated update tests.
- Cross-channel reconciliation.
- Network timeout/retry simulation.

