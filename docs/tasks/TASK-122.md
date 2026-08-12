# TASK-122 — Атомарно подтвердить AI receipt draft

Статус: pending

## Цель

Преобразовать только проверенный пользователем invoice draft в одну атомарную приёмку с catalog variants, costs, movements и audit trail.

## Предполагаемые файлы

- `supabase/migrations/<new>_confirm_document_receipt.sql`
- `features/receipt-documents/data/confirm-document-receipt.ts`
- `features/receipt-extraction/ui/extraction-review.tsx`

## Зависимости

TASK-092, TASK-119, TASK-121.

## Критерии готовности

- Только draft `ready` и явное действие Confirm могут изменить stock.
- Models/variants создаются или связываются по проверенному product code; optional barcodes не обязательны.
- Receipt lines сохраняют original currency/cost и FX snapshot.
- Receipt, variants, movements, draft status и audit event фиксируются в одной transaction.
- Source document и extracted source references остаются доступны для последующей проверки.
- Ошибка в любой строке откатывает всю приёмку.

## Тесты

- SQL integration: new/existing models, no-barcode variants, native FX and full rollback.
- Permission and cross-store denial tests.
- Explicit-confirm-only and audit/source trace tests.

