# TASK-004 — Показывать точные ошибки сохранения sale

Статус: COMPLETED

## Цель

Заменить общий fallback для известных database/RPC ошибок на стабильные локализованные domain errors.

## Предполагаемые файлы

- `features/sales/data/confirm-live-sale.ts`
- `features/sales/model/sale-errors.ts`

## Зависимости

TASK-001.

## Критерии готовности

- Ошибки stock, FX, duplicate line, cost, access и validation различаются.
- Неизвестная техническая ошибка не раскрывает внутренности базы.
- English и Turkish сообщения содержат понятное действие.

## Тесты

- Unit tests error mapping для каждого известного кода/сообщения.
- Unknown error возвращает безопасный fallback.
- `npx tsc --noEmit`.

## Результат

- Добавлен локализованный mapping ошибок stock, FX, duplicate, cost, access, payment и validation; неизвестные ошибки остаются безопасным fallback.
- Unit-тесты покрывают известные и неизвестные сообщения на English и Turkish.
