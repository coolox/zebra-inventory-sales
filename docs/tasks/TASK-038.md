# TASK-038 — Добавить Seller status management UI

Статус: pending

## Цель

Показывать pending/active/blocked Sellers и действия deactivate/reactivate владельцу.

## Предполагаемые файлы

- `features/sellers/ui/seller-list.tsx`
- `features/sellers/data/update-seller-status.ts`

## Зависимости

TASK-036, TASK-037.

## Критерии готовности

- Owner видит status и доступный action.
- Seller UI не содержит административных действий.
- Оптимистическое состояние откатывается при ошибке.

## Тесты

- Component role/state tests.
- Staging deactivate/reactivate smoke-test.
- Mobile layout test.

