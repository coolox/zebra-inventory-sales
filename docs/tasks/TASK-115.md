# TASK-115 — Автоматически рассчитывать цену одного товара из Mixed Payment

Статус: COMPLETED

## Цель

Восстановить согласованный сценарий Mixed Payment для одной позиции: введённые payment lines определяют цену продажи в EUR без ручного расчёта и ввода `Actual sale price`.

## Предполагаемые файлы

- `features/sales/ui/sale-flow.tsx`
- `features/sales/ui/sale-flow.test.tsx`
- `docs/DECISIONS.md`
- `docs/UI_REVIEW.md`
- `docs/PROJECT_STATUS.md`
- `CHANGELOG.md`

## Зависимости

TASK-113.

## Критерии готовности

- В `Per-item price` для одной выбранной позиции включение Mixed Payment скрывает ручной ввод цены.
- Цена sale line автоматически равна сумме payment lines в EUR по дневным FX-курсам.
- При незаполненных или некорректных payment lines форма показывает ошибку payment, а не требует вручную ввести цену.
- После валидного EUR-итога sale можно подтвердить с автоматически рассчитанной EUR-ценой.
- Режим `Total sale price` и multi-item Per-item сценарий не меняются.

## Тесты

- Component regression test EUR/USD Mixed Payment для одной позиции.
- `npm test`.
- `npx tsc --noEmit`.
- `npm run build`.

## Результат

- Для одной позиции в `Per-item price` включённый Mixed Payment скрывает ручные поля цены и валюты.
- Цена sale line автоматически рассчитывается в EUR из всех введённых payment lines и дневных FX-курсов.
- При пустой или некорректной строке оплаты пользователь видит validation payment, а не требование вручную ввести цену.
- Regression test подтверждает, что `50 EUR + 50 USD` создают EUR sale line `96.50` на demo rates.
- Полный suite 49/49, TypeScript и production build проходят; локальная browser QA подтвердила `€91.67` для актуального staging USD FX без создания продажи.
