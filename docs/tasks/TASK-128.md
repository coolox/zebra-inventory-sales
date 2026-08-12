# TASK-128 — Добавить review распознанных этикеток перед cart

Статус: pending

## Цель

Показать продавцу source photo, распознанные поля и найденный catalog variant, чтобы он исправил или подтвердил каждую позицию до добавления в sale cart.

## Предполагаемые файлы

- `features/sale-labels/ui/label-review.tsx`
- `features/sales/ui/sale-flow.tsx`
- `features/sales/model/types.ts`

## Зависимости

TASK-103, TASK-126, TASK-127.

## Критерии готовности

- Для каждого label видны photo preview, brand, Product code, color, size, match status, confidence и current stock.
- Seller может выбрать другое suggested model/variant, исправить fields, удалить label или перейти в manual picker.
- Exact match добавляется только после явного `Add to cart`; unknown label не создаёт новый product из Sale Flow.
- Несколько разных фотографий одного variant увеличивают draft quantity в пределах available stock.
- Повтор одного и того же file fingerprint не увеличивает quantity; seller может изменить quantity вручную с существующими stock guards.
- Actual price/payment остаются в утверждённом Per-item/Total sale flow и не берутся с этикетки.

## Тесты

- Exact/ambiguous/unknown/low-confidence review component tests.
- Duplicate image vs legitimate duplicate variant quantity.
- Reserved-stock regression с manual и AI-added cart lines.

