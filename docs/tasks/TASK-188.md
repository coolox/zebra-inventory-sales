# TASK-188 — Добавить Owner Cash / Kasa report по валютам и способам оплаты

Статус: COMPLETED

Приоритет: P1 — Owner нужен понятный отчёт по наличным и переводам, а не только
общая выручка.

Источник: Owner request from Reports dashboard, 2026-08-21.

## Запрос Owner

В Reports рядом с dimensions Seller, Supplier, Brand, Model и Category добавить
отдельную кнопку/вкладку `Касса` (`Kasa` / `Cash`). Она должна позволять распечатать
или экспортировать отчёт:

- сколько наличных принято в EUR, USD и каждой поддерживаемой валюте;
- сколько принято переводами и в какой валюте;
- итоги по payment method × currency за выбранный период;
- понятный общий итог и дата/время формирования отчёта.

## Важная финансовая граница

Отчёт обязан ясно различать:

- расчётно принятые платежи из immutable sale/payment ledger;
- физические деньги, которые фактически лежат в кассе;
- refunds/cancellations/exchanges и payment corrections.

Не называть ledger-derived число «фактической кассой», если physical cash count не
вводится и не подтверждается отдельной процедурой. Initial scope — read-only payment
summary; physical count/reconciliation не добавлять скрытно.

## Границы

- Owner-only Reports dimension, read-only server-side aggregation, EN/TR copy and
  existing CSV/XLSX/PDF/print export boundary.
- Использовать atomic sale/payment/exchange/cancellation data with store and date
  boundary; не менять payment writes, FX snapshots, ledger, cash handling or audit.
- Seller не получает full store cash/transfer report; no cross-store aggregation.

## Диагностика и design после завершения bug intake

- Согласовать payment-method taxonomy: cash, bank transfer and any existing mixed
  payment methods; не invent unsupported methods/currencies.
- Проверить how EUR/USD/TRY values, FX snapshots, refunds, cancelled and exchanged
  sales appear in source data and export.
- Определить default period, timezone/business-date label and whether total is shown
  per currency only (recommended) or converted with an explicitly dated FX basis.
- Подтвердить print/export layout and redaction/retention expectations with Owner.

## Критерии готовности

- Owner видит `Kasa` alongside permitted report dimensions and выбирает period.
- Отчёт показывает cash и transfer отдельно по каждой валюте, count/total и ясный
  источник данных; mixed payments не теряются и не double-counted.
- Cancellations/exchanges/refunds отображаются корректно и объяснимо; отсутствие
  данных, error, loading и partial data states не выглядят как нулевые деньги.
- Print/CSV/XLSX/PDF output содержит period, store, generated timestamp and clear
  method/currency columns; no unapproved PII or secret data.
- Owner-only server authorization/RLS, monetary precision, Istanbul business-date,
  EN/TR and mobile/desktop UI verified; tests and `npm run build` pass.

## Реализация

- Owner-only RPC `owner_cash_report` агрегирует captured платежи подтверждённых
  продаж и exchange top-up по Istanbul business date, payment method и исходной
  валюте. Отменённые/reversed продажи исключаются; физический cash count не
  моделируется и не подменяется ledger-суммой.
- В Reports добавлена отдельная `Cash` / `Kasa` вкладка с period, payment count,
  method × currency amounts, loading/error/empty состояниями, CSV export и print.
  Existing XLSX/PDF теперь включают отдельный Cash section с period, store,
  generated timestamp и method/currency columns.
- RPC проверяет Owner server-side; Seller получает `42501` и не может получить
  store-wide cash/transfer data.

## Evidence

- `supabase/tests/database/035_owner_cash_report_test.sql`: 4/4 pgTAP passed
  (EUR cash, USD transfer, cancelled/reversed exclusion, Seller denial).
- `npx vitest run features/reports/ui/reports-dashboard.test.tsx
  features/reports/export/xlsx.test.ts features/reports/export/pdf.test.ts`:
  6/6 passed.
- `npm run build`: passed.
- TASK-191 updated the XLSX/PDF route mocks for the required Cash RPC result and
  verified the Cash worksheet path. Targeted export routes passed 4/4 and the final
  full Vitest gate passed 243/243.
