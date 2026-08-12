# TASK-112 — Сделать Price Type первым шагом Sale Flow

Статус: COMPLETED

## Цель

Требовать выбор `Per-item price` или `Total sale price` сразу после открытия New Sale и правильно расположить `Mixed payment` в обоих режимах.

## Предполагаемые файлы

- `features/sales/ui/sale-flow.tsx`
- `features/sales/ui/sale-flow.test.tsx`
- `docs/PROJECT_STATUS.md`
- `CHANGELOG.md`

## Зависимости

TASK-109, TASK-110.

## Критерии готовности

- `Price Type` — первый шаг New Sale.
- До выбора price type поля товара скрыты.
- После выбора идут Product code → Color → Size.
- В `Per-item price` Mixed payment находится перед Actual sale price.
- В `Total sale price` Mixed payment остаётся перед общей суммой.
- Оба режима поддерживают Add another item и текущую server payload семантику.

## Тесты

- Component tests начального выбора и расположения Mixed payment.
- `npm run test`.
- `npx tsc --noEmit`.
- `npm run build`.

## Результат

- Price Type стал первым обязательным шагом без заранее выбранного режима.
- Поля товара появляются только после выбора pricing mode.
- В Per-item price Mixed payment расположен перед Actual sale price.
- В Total sale price Mixed payment остаётся перед общей суммой.
- 18 tests, TypeScript и production build проходят.
