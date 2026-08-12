# TASK-092 — Добавить UI проверки OCR draft

Статус: pending

## Цель

Дать пользователю сравнить source document с extracted draft, исправить строки, проверить catalog matching и подготовить обычный receipt confirmation.

## Предполагаемые файлы

- `features/receipt-extraction/ui/extraction-review.tsx`
- `features/receipts/ui/receive-flow.tsx`

## Зависимости

TASK-019, TASK-091, TASK-120, TASK-121.

## Критерии готовности

- Source preview и extracted fields сопоставимы.
- Пользователь может исправить/удалить строки.
- Для каждой строки видны invoice quantity, распределённое по variants количество и остаток к распределению.
- Неоднозначные/новые product codes требуют явного выбора или создания модели; fuzzy match не объединяет товар автоматически.
- Barcode не обязателен и не блокирует review/confirm.
- Только явный Confirm вызывает receipt mutation через TASK-122.

## Тесты

- Component low-confidence/edit/confirm tests.
- Mobile document review smoke.
- Integration with receipt validation.
