# TASK-066 — Добавить Exchange UI

Статус: pending

## Цель

Провести Seller через исходную sale line, новый variant, разницу и payment confirmation.

## Предполагаемые файлы

- `features/exchanges/ui/exchange-flow.tsx`
- `features/exchanges/data/confirm-exchange.ts`
- `app/(dashboard)/sales/page.tsx`

## Зависимости

TASK-062, TASK-065.

## Критерии готовности

- Picker показывает только доступные variants.
- UI явно объясняет доплату или отсутствие возврата разницы.
- После success обновляются sale history, stock и activity.

## Тесты

- Component tests three price-difference cases.
- Staging exchange smoke-test.
- Mobile portrait flow.

