# TASK-109 — Перестроить Sale Flow для цены всей продажи

Статус: COMPLETED

## Цель

Дать продавцу сначала добавить все товары, затем выбрать цену по товарам или общую цену sale и принять single/mixed payment за всю корзину.

## Предполагаемые файлы

- `features/sales/ui/sale-flow.tsx`
- `features/sales/ui/payment-editor.tsx`
- `lib/i18n.ts`
- `docs/tasks/TASK-109.md`

## Зависимости

TASK-108.

## Критерии готовности

- `Add another item` работает независимо от single/mixed payment.
- После состава корзины продавец выбирает `Per-item price` или `Total sale price`.
- В `Total sale price` Mixed payment доступен для любого числа товаров.
- Пример с тремя футболками и 50 EUR + 50 USD подтверждается как одна sale.
- Обычный сценарий без Mixed payment остаётся коротким.
- UI адаптивен и локализован на English/Turkish.

## Тесты

- Component tests ключевых переходов и disabled/error states.
- Проверка desktop/mobile layout.
- Typecheck и production build.

## Результат

- После выбора variant доступны `Per-item price` и `Total sale price`.
- В общей цене товары добавляются без отдельных сумм.
- Mixed payment расположен перед вводом общей суммы и работает для multi-item sale.
- Обычный per-item flow сохранён.
