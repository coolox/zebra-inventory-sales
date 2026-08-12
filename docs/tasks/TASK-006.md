# TASK-006 — Добавить client model mixed-payment draft

Статус: COMPLETED

## Цель

Определить типы и чистую валидацию payment lines до отправки в live RPC.

## Предполагаемые файлы

- `features/sales/model/types.ts`
- `features/sales/model/payments.ts`

## Зависимости

TASK-005.

## Критерии готовности

- Payment draft поддерживает Cash/Card/Bank transfer и EUR/USD/TRY/RUB/GBP.
- Валидация запрещает нулевые, отрицательные и пустые строки.
- Расчёт EUR preview использует явные rates и tolerance.

## Тесты

- Unit tests валидной single и mixed payment.
- Unit tests invalid amount/currency/mismatch.
- `npx tsc --noEmit`.

## Результат

- Добавлены типы payment draft, разрешённые методы/валюты и чистый EUR preview с проверкой положительных сумм и tolerance.
- Unit-тесты покрывают single, mixed и invalid/mismatched payment scenarios.
