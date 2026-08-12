# TASK-117 — Зафиксировать code-first product identity и optional barcode

Статус: pending

## Цель

Сделать обязательный `Product code / Ürün Kodu` и внутренние UUID единственной основой inventory, оставив barcode необязательным дополнительным идентификатором на будущее.

## Предполагаемые файлы

- `docs/DATA_MODEL.md`
- `supabase/migrations/<new>_product_identifiers.sql`
- `features/catalog/model/**`
- `features/receipts/model/**`

## Зависимости

TASK-026, TASK-027.

## Критерии готовности

- Product model имеет обязательный store-scoped product code; ведущие нули и буквы сохраняются.
- Stock, movements, receipts и sales ссылаются только на internal model/variant UUID, а не на barcode.
- Barcode nullable и может быть добавлен/изменён позже без изменения stock или истории.
- Supplier barcode с color/size хранится на variant; model-level identifier разрешён только когда он действительно общий для модели.
- QR не записывается как barcode без декодирования и проверки payload.
- Локальная migration TASK-026 пересмотрена до любого staging application; существующие barcode не теряются.

## Тесты

- Product/variant без barcode проходит receipt, sale и inventory flow.
- Leading-zero/alphanumeric product code cases.
- Добавление barcode позже не меняет stock/movements.
- Duplicate non-empty identifier cases в пределах store и cross-store.

