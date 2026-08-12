# TASK-027 — Подключить barcode к поиску, sale и receipt UI

Статус: COMPLETED

## Цель

Позволить вручную вводить существующий barcode и находить нужную модель/variant без изменения утверждённого picker flow.

## Предполагаемые файлы

- `features/catalog/data/load-live-catalog.ts`
- `features/catalog/ui/**`
- `features/sales/ui/sale-flow.tsx`
- `features/receipts/ui/receive-flow.tsx`
- `lib/types.ts`

## Зависимости

TASK-026, TASK-018, TASK-023.

## Критерии готовности

- Catalog загружает barcode.
- Поиск code/barcode приводит к корректной модели.
- Receipt сохраняет barcode без обязательного AI/OCR.

## Тесты

- Unit search tests code vs barcode.
- Component tests sale/receipt barcode input.
- Local demo smoke-test; необязательную ручную проверку владелец выполнит позже, когда barcode flow понадобится.

## Текущий прогресс

- Реализованы catalog lookup и ручной ввод barcode в Sale/Receive; unit и component tests проходят.
- Локальный demo smoke подтверждает barcode `869000990200`: Inventory находит четыре варианта `KM-9902`, Sale оставляет picker color → size, Receive подставляет модель и переносит barcode в receipt draft.
- По решению владельца barcode остаётся необязательной будущей возможностью и сейчас не входит в обязательный operational flow. Staging smoke-test снят с блокирующих критериев; migration TASK-026 не применяется до пересмотра identity policy в TASK-117.
- Inventory, receipt, sale и stock movements продолжают опираться на internal model/variant IDs и обязательный product code, а не на наличие barcode.
