# TASK-120 — Сопоставлять строки накладной с catalog по Product code

Статус: pending

## Цель

Надёжно связать extracted invoice lines с существующими моделями или явным предложением создать новую модель, используя Product code как основной ключ.

## Предполагаемые файлы

- `features/receipt-extraction/model/catalog-matching.ts`
- `features/receipt-extraction/ui/**`
- `features/catalog/data/**`

## Зависимости

TASK-091, TASK-117, TASK-119.

## Критерии готовности

- Exact normalized product-code match имеет первый приоритет.
- Supplier/brand article может быть дополнительным alias, но barcode не обязателен.
- Неоднозначный или fuzzy match никогда не объединяет товары автоматически.
- Для неизвестного code создаётся только review proposal с предзаполненным description, supplier и cost.
- Пользователь видит `matched`, `new`, `ambiguous` и `low confidence` для каждой строки.

## Тесты

- Exact, leading-zero, alphanumeric, unknown and ambiguous matching cases.
- Cross-store isolation test.
- No automatic fuzzy merge test.

