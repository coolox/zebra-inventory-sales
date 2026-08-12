# TASK-119 — Добавить domain model черновика накладной

Статус: pending

## Цель

Создать безопасный receipt-document draft, который хранит распознанную накладную до catalog matching и не изменяет stock.

## Предполагаемые файлы

- `supabase/migrations/<new>_receipt_document_drafts.sql`
- `features/receipt-documents/model/**`
- `docs/DATA_MODEL.md`

## Зависимости

TASK-033, TASK-117.

## Критерии готовности

- Header: store, supplier, invoice number/date, currency, expected total quantity, document total and source document.
- Lines: preserved product code, description, expected quantity, unit cost, line total, confidence and source reference.
- Draft statuses: uploaded → extracting → needs_review → ready → confirmed/failed.
- Product codes хранятся как text; `00012`, `V127`, `YS032`, `5047C` не преобразуются в числа.
- Draft rows не создают catalog records, receipts или movements.

## Тесты

- Schema/RLS tests для Owner/Seller store scope.
- Decimal comma and leading-zero serialization tests.
- No-stock-mutation assertion для каждого pre-confirm status.

