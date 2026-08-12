# TASK-125 — Извлекать данные с товарной этикетки

Статус: pending

## Цель

Распознавать каждую загруженную этикетку в структурированный sale-label draft с confidence и source regions.

## Предполагаемые файлы

- `features/sale-labels/data/extract-label.ts`
- `features/sale-labels/model/label-extraction.ts`
- `app/api/sales/labels/extract/route.ts`

## Зависимости

TASK-090, TASK-124.

## Критерии готовности

- Extraction возвращает optional brand, product/model/article code, color, size, linear barcode и decoded QR payload.
- Product/model code, leading zeros и alphanumeric values сохраняются как text.
- Rotated, blurred, cropped и mixed EN/TR labels дают confidence/needs_review, а не выдуманные значения.
- Printed retail price распознаётся только как справочная source text и никогда не становится actual sale price автоматически.
- Barcode/QR не обязателен; QR не используется для matching до безопасного decode/validation.
- Provider errors/timeouts не изменяют cart или stock.

## Тесты

- Sanitized fixtures разных брендов, размеров, цветов, barcode/no-barcode/QR-only.
- Rotation/blur/partial-label and low-confidence tests.
- Provider timeout/retry и no-side-effect assertions.

