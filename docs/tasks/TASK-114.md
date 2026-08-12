# TASK-114 — Исправить QA-дефекты светлой темы, приёмки и сортировки остатков

Статус: COMPLETED

## Цель

Исправить три дефекта, найденные владельцем при ручной проверке приложения: контраст полей Receive Flow в светлой теме, непонятное заблокированное завершение приёмки и расположение нулевых остатков в Inventory.

## Предполагаемые файлы

- `app/globals.css`
- `app/page.tsx`
- `features/receipts/model/receipt-copy.ts`
- `features/receipts/ui/receive-flow.tsx`
- `features/receipts/ui/receive-flow.test.tsx`
- `features/catalog/model/sort-products-by-availability.ts`
- `features/catalog/model/sort-products-by-availability.test.ts`
- `docs/UI_REVIEW.md`
- `docs/PROJECT_STATUS.md`
- `CHANGELOG.md`

## Зависимости

TASK-020.

## Критерии готовности

- В светлой теме placeholder визуально вторичен, а введённое значение тёмное и читаемое.
- Выбранное количество не превращается в ложный итог `0` из-за незаполненных обязательных полей.
- При попытке сохранить неполный новый товар интерфейс явно сообщает, какие данные нужно заполнить.
- После заполнения обязательных полей выбранные размеры можно принять.
- В Inventory варианты с положительным остатком расположены перед вариантами с нулевым остатком до пагинации.
- Поведение работает на desktop и mobile.

## Тесты

- Component regression tests Receive Flow.
- Unit test сортировки Inventory.
- `npm test`.
- `npx tsc --noEmit`.
- `npm run build`.

## Результат

- В Light theme введённые значения получили тёмный цвет, а placeholder — отдельный светлый вторичный цвет.
- Receive Flow показывает выбранное количество независимо от заполненности метаданных и явно объясняет, что серые примеры не являются введёнными значениями.
- После выбора размера кнопки доступны; неполный товар не отправляется, а после заполнения обязательных полей сохраняется прежним безопасным сценарием.
- Inventory сортирует доступные варианты перед нулевыми до применения пагинации.
- Добавлены component/unit regression tests; полный suite 49/49, TypeScript и production build проходят.
- Desktop и mobile-width browser QA прошли без console errors; staging/production данные не изменялись.
