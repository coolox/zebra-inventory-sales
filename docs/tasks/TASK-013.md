# TASK-013 — Добавить integration tests sales RPC

Статус: COMPLETED

## Цель

Проверить атомарность, FX snapshots, repeated variant lines и mixed payments на реальной Postgres schema.

## Предполагаемые файлы

- `supabase/tests/sales_rpc_test.sql`

## Зависимости

TASK-001, TASK-005, TASK-012.

## Критерии готовности

- Покрыты success, insufficient stock, missing FX и payment mismatch.
- Покрыт конкурентный или последовательно конфликтующий stock сценарий.
- Проверены audit и inventory movements.

## Тесты

- Полный Supabase SQL test suite.
- Два последовательных запуска после reset.

## Прогресс

- 2026-08-10: добавлен self-contained pgTAP integration suite `supabase/tests/database/010_sales_rpc_test.sql` с изолированными fixture-данными и rollback в конце каждого run.
- Проверены mixed EUR/USD payments с FX snapshot, repeated variant lines, movements и audit, а также atomic rollback для insufficient stock, missing FX и payment mismatch.
- Последовательный конфликт остатков подтверждён: первая sale списывает stock, следующая не может oversell variant. Два последовательных `npm run supabase:verify` прошли с чистой базы: 25/25 checks — PASS.
