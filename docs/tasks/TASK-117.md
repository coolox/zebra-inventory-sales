# TASK-117 — Зафиксировать code-first product identity и optional barcode

Статус: COMPLETED

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

## Выполнено

- Добавлена migration `20260814110000_code_first_product_identity.sql`: непустой и
  normalized store-scoped `model_code`, без переписывания сохранённых code/barcode;
  UUID остаются ссылками receipt, movement и sale.
- Общий model barcode и variant barcode разделены в contract/Receive Flow. Для каждого
  color/size можно указать отдельный optional supplier barcode, который передаётся в
  `confirm_inventory_receipt` как barcode конкретной строки.
- Raw QR URI/card payload database отклоняет до появления отдельного decode/validate
  scanner flow. Review прежней barcode migration завершён: сохранённые barcode не
  удаляются; staging application остаётся в TASK-146.

## Evidence

- `npm test -- --run` — 73 files / 173 tests passed.
- `npm run lint` — 0 errors, 24 pre-existing warnings.
- `npm run build:demo` и `npm run build:live` — passed.
- Clean local `supabase:reset`, затем `npm run supabase:test` — 28 migrations,
  13 pgTAP files / 169 assertions passed. Targeted barcode pgTAP test passed with
  14 assertions, including no-barcode UUID history, delayed barcode, duplicate code
  and raw-QR rejection.

Staging и production не изменялись.
