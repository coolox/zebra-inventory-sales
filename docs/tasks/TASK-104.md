# TASK-104 — Выбирать Mixed payment до цены продажи

Статус: COMPLETED

## Цель

Перенести выбор Mixed payment перед вводом цены и в этом режиме рассчитывать цену одного товара автоматически из payment lines.

## Предполагаемые файлы

- `features/sales/model/payments.ts`
- `features/sales/model/payments.test.ts`
- `features/sales/ui/payment-editor.tsx`
- `features/sales/ui/sale-flow.tsx`
- `features/sales/ui/sale-flow.test.tsx`
- `docs/DECISIONS.md`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-101, TASK-102, TASK-103.

## Критерии готовности

- Mixed payment выбирается после size и до обычных price/currency/payment method fields.
- Без галочки работает обычный сценарий.
- С галочкой обычные поля скрыты и сразу показаны две payment lines.
- Цена единственного товара сохраняется в EUR как сумма payment lines по дневным rates.
- Mixed payment недоступен для multi-item sale.

## Тесты

- Unit test расчёта EUR total из payment lines.
- Component tests normal, mixed и multi-item modes.
- `npm run test`, `npx tsc --noEmit`, `npm run build`.

## Результат

- Чекбокс Mixed payment расположен после size и до обычных price/currency/payment method fields.
- В mixed mode показываются две payment lines, а sale line получает автоматически рассчитанную EUR-цену.
- Mixed payment скрыт после перехода в multi-item sale.
