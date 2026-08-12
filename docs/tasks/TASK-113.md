# TASK-113 — Сразу показывать Mixed payment в Per-item price

Статус: COMPLETED

## Цель

Показывать строки смешанной оплаты сразу после включения `Mixed payment` в режиме `Per-item price`, не ожидая ввода цены товара.

## Предполагаемые файлы

- `features/sales/ui/sale-flow.tsx`
- `features/sales/ui/payment-editor.tsx`
- `features/sales/ui/sale-flow.test.tsx`
- `docs/PROJECT_STATUS.md`
- `docs/CURRENT_STATE.md`
- `docs/ROADMAP.md`
- `CHANGELOG.md`

## Зависимости

TASK-112.

## Критерии готовности

- После выбора товара и включения `Mixed payment` сразу видны две строки оплаты.
- Для показа строк не требуется сначала вводить Actual sale price.
- До ввода цены интерфейс просит указать цену и не показывает ложную ошибку баланса.
- После ввода цены действуют прежние проверки суммы и валютных курсов.
- Поведение режима `Total sale price` не меняется.

## Тесты

- Component test немедленного появления двух строк оплаты.
- `npm run test`.
- `npx tsc --noEmit`.
- `npm run build`.

## Результат

- В Per-item price две начальные строки Mixed payment появляются сразу после включения чекбокса, до ввода Actual sale price.
- До ввода цены редактор показывает нейтральную подсказку вместо ложной ошибки баланса.
- После ввода цены сохраняются прежние проверки суммы и FX; Total sale price не изменён.
- Проходят 19 tests, TypeScript и production build.
