# TASK-068 — Добавить reporting metrics API

Статус: COMPLETED

## Цель

Получать оборот, себестоимость, margin, sale count, units и average ticket из confirmed financial snapshots.

## Предполагаемые файлы

- `supabase/migrations/<new>_reporting_metrics.sql`
- `features/reports/data/load-metrics.ts`

## Зависимости

TASK-063, TASK-065.

## Критерии готовности

- Cancelled/reversed operations учитываются корректно.
- Все totals представлены в EUR snapshot.
- RLS ограничивает store scope.

## Тесты

- SQL fixtures sale/cancel/exchange.
- Metric reconciliation against raw lines.
- RLS tests.

## Результат

- Добавлен store-scoped `get_reporting_metrics` RPC: turnover, себестоимость, margin, sale count, units и average ticket возвращаются из EUR snapshots.
- Отменённые продажи и exchange, чей source sale отменён, не учитываются; exchange добавляет только фактическую EUR-доплату и не создаёт второй sale ticket или units.
- Добавлен typed browser adapter `features/reports/data/load-metrics.ts` без client-side расчёта или fallback-данных.

## Проверка

- `npm run supabase:test` — 11 files / 123 checks passed, включая sale/cancellation/exchange reconciliation и RLS boundary.
- `npm test -- --run` — 127/127 passed.
- `npx tsc --noEmit`, `npm run build`, `git diff --check` — passed.
- Локальный Supabase был использован только для проверки и снова поставлен на паузу. Staging/production не изменялись.
