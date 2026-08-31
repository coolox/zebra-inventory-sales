# TASK-209 — Строгий TCMB parser и нормализация FX-курсов

Статус: COMPLETED

## Цель

Создать изолированную, не пишущую в базу основу для server-side автоматизации
курсов: строго разобрать дневной XML TCMB и привести `Döviz Satış` для EUR/USD к
существующему storage contract `eur_rate`.

## Границы

- Только pure TypeScript parser/normalizer и fixture tests.
- Поддерживаются EUR, USD и TRY. TCMB публикует TRY-per-currency: результат
  обязан быть `EUR = 1`, `TRY = 1 / T_EUR`, `USD = T_USD / T_EUR`.
- Parser обязан отклонять пустой, malformed, entity/doctype, duplicate,
  missing-currency, missing-rate и invalid-date input.
- Никакого browser request к TCMB, scheduler, migration, изменения existing
  manual Owner flow или production publication в этой задаче нет.

## Зависимости

- TASK-088 (pilot parent; Owner явно разрешил FX backlog).
- D-070.

## Критерии готовности

- Валидный TCMB fixture выдаёт source date и нормализованные EUR/USD/TRY rates.
- Выбран только `ForexSelling` (`Döviz Satış`); buying/midpoint не смешиваются.
- Ошибочный источник не даёт частичных/молчаливо выдуманных курсов.
- Unit tests и production build проходят.

## Handoff

После completion создать отдельную TASK для schema/provenance и server-side sync;
не добавлять cron, service credentials или database writes без её явной scope.

## Результат

2026-08-31: Добавлен `features/exchange-rates/model/tcmb-rates.ts`: он принимает
только TCMB `Tarih_Date` XML без entities/doctype, требует ровно один EUR и USD
`ForexSelling`, валидирует календарную source date и нормализует EUR/USD/TRY к
`eur_rate`. Некорректный вход отвергается до формирования результата.

Проверки: `npm test -- --run features/exchange-rates/model/tcmb-rates.test.ts`
(8/8), `npm run build:demo` и `npm run build` прошли. Существующие warnings в
`app/page.tsx` не относятся к этой задаче. Нет migration, scheduler, network
runtime, database write или publication.
