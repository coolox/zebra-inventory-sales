# TASK-067 — Добавить Seller sales history filters

Статус: COMPLETED

## Цель

Дать Owner/Seller фильтрацию history по продавцу, status и business period без отдельной shift entity.

## Предполагаемые файлы

- `features/sales/model/sale-history-filters.ts`
- `features/sales/ui/sale-history.tsx`

## Зависимости

TASK-062.

## Критерии готовности

- Owner фильтрует Sellers своего store; Seller scope соблюдён.
- Wednesday–Tuesday week вычисляется корректно.
- Filters отражаются в URL/query state.

## Тесты

- Date/filter unit tests.
- Role filter component tests.
- Direct-link browser test.

## Результат

- В Sales History добавлены фильтры Owner по продавцу, статусу и периоду; Seller не видит выбор продавца и всегда ограничен собственной областью.
- Неделя бизнеса рассчитывается с среды по вторник, а выбранные фильтры синхронизируются с query-параметрами `saleSeller`, `saleStatus` и `salePeriod`.
- Добавлены unit/component/browser regression tests для периода, role scope и прямой ссылки.

## Проверка

- `npm test -- --run` — 125/125 passed.
- `npx tsc --noEmit`, `npm run build`, `git diff --check` — passed.
- Playwright desktop: direct-link filters и cancellation smoke — 2/2 passed.
