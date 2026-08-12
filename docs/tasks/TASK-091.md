# TASK-091 — Добавить OCR extraction draft service

Статус: pending

## Цель

Преобразовывать receipt image/PDF в неподтверждённую структуру накладной с confidence и source references. Catalog matching и stock mutation выполняются только следующими задачами.

## Предполагаемые файлы

- `features/receipt-extraction/**`
- `app/api/receipts/extract/route.ts`
- `.env.example`

## Зависимости

TASK-089, TASK-090, TASK-119.

## Критерии готовности

- Header extraction: supplier, invoice number, invoice date, currency, expected total quantity and document total.
- Line extraction: required `product_code`, description, expected quantity, unit cost and line total.
- Decimal comma, leading zero codes (`00012`) и alphanumeric codes (`V127`, `YS032`, `5047C`) сохраняются как строки без потери формата.
- Каждое поле содержит confidence и source page/region reference.
- Low-confidence fields помечены.
- Retry/idempotency не создаёт duplicate stock operations.
- Secrets находятся вне repo.

## Тесты

- Contract tests with sanitized fixtures.
- Provider error/timeout/retry tests.
- No-stock-mutation assertion.
