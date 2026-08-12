# TASK-018 — Перенести Receive Flow в features/receipts

Статус: completed

## Цель

Завершить UI-границу receipts и удалить legacy component path.

## Предполагаемые файлы

- `features/receipts/ui/receive-flow.tsx`
- `components/receive-flow.tsx`
- `app/page.tsx`

## Зависимости

TASK-016, TASK-017.

## Критерии готовности

- Receive Flow импортируется только из feature.
- Поведение code suggestions и color-size matrix сохранено.
- Legacy файл удалён без dangling imports.

## Тесты

- `rg` не находит старый import.
- `npx tsc --noEmit`.
- `npm run build`.
