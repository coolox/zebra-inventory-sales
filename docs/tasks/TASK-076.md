# TASK-076 — Добавить reconciliation/discrepancy report

Статус: COMPLETED

## Цель

Выявлять несогласованные sale/payment/movement totals и ручные inventory corrections.

## Предполагаемые файлы

- `supabase/migrations/<new>_reconciliation_report.sql`
- `features/reports/data/load-discrepancies.ts`
- `features/reports/ui/discrepancy-report.tsx`

## Зависимости

TASK-063, TASK-065, TASK-068, TASK-071.

## Критерии готовности

- Report находит payment mismatch, missing movement и unexpected negative balance.
- Каждая строка содержит source IDs для аудита.
- Только Owner имеет доступ.

## Тесты

- SQL fixtures для каждого discrepancy.
- False-positive-free clean dataset test.
- RLS and UI empty/error tests.

## Выполнено

- Добавлен read-only Owner-only reconciliation RPC для payment mismatch, отсутствующих sale movements, negative balance и manual corrections.
- Каждая строка содержит JSON source IDs и ожидаемое/фактическое значение, не изменяя ledger.
- В Owner Reports добавлены loading, empty, error/retry и tabular audit states.
- pgTAP fixture покрывает каждый тип discrepancy, чистый dataset и Owner-only RLS.
