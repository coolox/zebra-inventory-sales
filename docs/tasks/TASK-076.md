# TASK-076 — Добавить reconciliation/discrepancy report

Статус: pending

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

