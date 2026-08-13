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

## Проверка учёта 2026-08-13

- Реализация UI фактически появилась в рамках TASK-051: Owner видит `pending`/`active`/`blocked`, получает доступное действие deactivate/reactivate, а Seller не получает административный компонент.
- `SellerList` оптимистично меняет status и возвращает предыдущее состояние при ошибке adapter; это покрыто component test.
- Повторно выполнены `seller-list.test.tsx` и `seller-manager.test.tsx`: 4/4 tests проходят.
- TASK остаётся `pending`, потому что в репозитории нет зафиксированного visual smoke через staging UI и отдельного mobile layout smoke. Backend staging smoke из TASK-037 не заменяет эти два UI-критерия.
