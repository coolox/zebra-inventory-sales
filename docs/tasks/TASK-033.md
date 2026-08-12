# TASK-033 — Добавить справочник suppliers

Статус: COMPLETED

## Цель

Дать Owner отдельный список поставщиков с create/edit/archive без дублирования имён при receipt.

## Предполагаемые файлы

- `supabase/migrations/<new>_supplier_management.sql`
- `features/suppliers/**`

## Зависимости

TASK-018.

## Критерии готовности

- Owner управляет suppliers своего store.
- Receipt использует выбранного или созданного supplier.
- Archive не ломает исторические receipts.

## Тесты

- RPC/RLS tests.
- Form validation and duplicate-name tests.
- Receipt integration smoke-test.

## Реализация

- Добавлена Owner-only supplier management migration с save/edit/archive/restore RPC и audit trail.
- Добавлены typed supplier data layer и manager в Inventory для demo/live режима.
- Supplier archive меняет только `is_active`; существующие `purchase_receipts.supplier_id` не удаляются.
- Migration применена на staging 2026-08-11; владелец подтвердил UI-проверку сценария.
