# TASK-179 — Исправить границу «Сегодня» в Sales History около полуночи

Статус: COMPLETED

Приоритет: P1 — продажи попадают в неверный операционный день и смешиваются в
финансовой истории.

Источник: Owner physical mobile walkthrough, 2026-08-21.

## Наблюдение

Owner сделал продажи около границы дня:

- продажи около `23:40` отображались как сделанные «сегодня»;
- после полуночи были сделаны продажи в `00:11` и `00:27`, но они добавлялись как
  «вчерашние»;
- при фильтре Sales History `Сегодня` одновременно видны продажи до полуночи и
  после полуночи соседних календарных дней.

На screenshot Turkish `Bugün` список содержит позиции со временем `20:17` и `00:11`,
что подтверждает смешение date boundary. Точная дата теста, device timezone, Android
version/browser и server timestamp должны быть записаны только на безопасной staging
fixture после завершения bug intake.

## Ожидаемый результат

Для Zebra Boutique «Сегодня», создание sale, Sales History, reports и audit должны
использовать один согласованный Istanbul business date. Продажа до `23:59:59` должна
принадлежать предшествующему business date, а с `00:00:00` — следующему; фильтр
`Сегодня` не смешивает обе группы.

## Диагностика после завершения сбора багов Owner

- Воспроизвести safe staging sales непосредственно до и после Istanbul midnight,
  включая `23:40`, `00:11` и `00:27` fixture times.
- Сравнить client timezone/locale, browser `Date`, request payload, database
  timestamptz/business-date calculation, RPC filters, Sales History grouping и
  reports/audit query boundaries.
- Проверить DST/non-Istanbul device timezone и refresh/relogin boundary, не
  полагаясь на локальные часы телефона как на источник business date.
- Установить, где возникает mismatch: sale write, live loader/filter или UI label;
  historical records не переписывать без отдельного audited decision.

## Критерии готовности

- Safe sales до и после Istanbul midnight получают корректный, одинаковый во всех
  представлениях business date.
- `Сегодня` включает только продажи текущего Istanbul day; `Вчера` — только
  предыдущего, без overlap/gap.
- Owner/Seller store boundaries, pagination, cancellation/exchange, reports и audit
  не получают date regression.
- EN/TR date labels объясняют выбранный период, если это необходимо для избежания
  ambiguity.
- Targeted database/UI time-boundary tests, `npm run build` и physical mobile
  midnight recheck проходят.

## Ограничение текущего этапа

Physical Redmi 14 recheck выполняется только на consolidated remediation Preview в
TASK-165. До него не заявлять, что physical acceptance подтверждена.

## Результат

- Причина найдена в live Sales History adapter: он считал `dayOffset` как прошедшие
  24 часа (`Date.now() - sold_at`), а не как Istanbul calendar date. Поэтому sale
  в `23:40` и sale в `00:11` могли оба получить offset `0`.
- Добавлен общий `lib/business-date.ts` с единственным `Europe/Istanbul` calendar
  contract. Live sales, Sales History week/today filter, demo Reports и Audit date
  filter больше не используют timezone устройства или elapsed-24-hour boundary.
- Server-side sale/Reports/Seller summary уже вычисляли
  `(timestamp at time zone store.timezone)::date`; migration не нужна и historical
  records не переписывались.

## Evidence

- New unit coverage: Istanbul `23:40` → previous business day, `00:11`/`00:27` →
  current day; `Today` includes only offset `0`. Targeted Vitest passed 15/15:
  business-date, Sales History filters, Reports period/demo report and Audit Log.
- Local Supabase pgTAP `030_seller_sales_summary_test.sql` passed 20/20, including
  Istanbul midnight/week boundary and Owner/Seller scope assertions.
- `npm run build` and `npm run build:live` passed. Existing unrelated lint warnings
  remain warnings.
- Consolidated Preview physical test remains mandatory: create safe `23:40`, `00:11`
  and `00:27` sales on Redmi 14; confirm Today/Yesterday/Reports/Audit in TASK-165.
