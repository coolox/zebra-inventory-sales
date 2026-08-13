# TASK-137 — Исправить preview QA: exchange currencies и demo reports

Статус: COMPLETED

## Цель

Исправить найденные Owner QA-дефекты в Vercel demo preview без изменения staging/production.

## Границы

- Exchange показывает эквивалент top-up для каждой доступной payment currency.
- Demo Reports рассчитываются из local sales, exchanges и inventory вместо нулевых значений.
- Seller не видит Owner-only Reports section.

## Критерии готовности

- Currency options не показывают одну и ту же сумму при разных FX rates.
- Новая demo sale, cancellation и positive exchange top-up отражаются в Owner report.
- Seller не видит Reports nav/section.
- Unit/component и production build проходят.

## Выполнено

- Payment currency options теперь вычисляют собственный эквивалент top-up по FX rate, до выбора валюты.
- Demo Owner Reports считают confirmed sales, cancellation, positive exchange top-ups и актуальные остатки; отчёт обновляется при изменении demo-данных.
- Seller больше не получает пустой Owner-only Reports section и не инициирует загрузку отчёта.

## Проверка

- `npm test -- --run features/exchanges/ui/exchange-flow.test.tsx features/reports/ui/reports-dashboard.test.tsx features/reports/model/demo-report.test.ts` — 7/7.
- `npm run build` — успешно.
