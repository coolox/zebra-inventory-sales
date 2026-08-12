# TASK-019 — Полностью локализовать Receive Flow на Turkish

Статус: completed

## Цель

Убрать English fallback из receipt формы, validation, empty и error states.

## Предполагаемые файлы

- `features/receipts/ui/receive-flow.tsx`
- `features/receipts/model/receipt-copy.ts`

## Зависимости

TASK-018.

## Критерии готовности

- Все видимые строки имеют en/tr варианты.
- Domain values остаются стабильными English keys.
- Переключение locale не сбрасывает draft.

## Тесты

- Component tests ключевых en/tr состояний.
- Source scan на hardcoded English UI внутри feature.
- Mobile smoke-test.
