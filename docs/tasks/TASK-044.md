# TASK-044 — Добавить RLS regression suite

Статус: COMPLETED

## Цель

Зафиксировать Owner/Seller/cross-store доступ для всех существующих таблиц и RPC.

## Предполагаемые файлы

- `supabase/tests/rls_test.sql`

## Зависимости

TASK-012, TASK-028, TASK-031, TASK-035, TASK-037, TASK-041.

## Критерии готовности

- Read/write matrix покрывает profiles, memberships, catalog, inventory, sales, payments и audit.
- Anonymous access запрещён.
- Cross-store data isolation подтверждена.

## Тесты

- Fresh local Supabase reset + RLS suite.
- Повторный прогон после clean reset.

## Результат

- Добавлен `supabase/tests/database/025_rls_regression_test.sql`: проверяет Owner/Seller/cross-store/anonymous read matrix, audit visibility и запрет прямых catalog/inventory/audit writes.
- `npm run supabase:verify` и отдельный `npm run supabase:test` завершились успешно локально.
