# TASK-174 — Сделать суммы и термины Reconciliation понятными Owner

Статус: COMPLETED

Приоритет: P1 — финансовые суммы без понятного смысла могут привести к неверному
операционному решению.

Источник: Owner physical walkthrough screenshot, 2026-08-21.

## Наблюдение

В Turkish Reconciliation карточки manual stock correction используют короткие
подписи `BEKLENEN` и `GERÇEKLEŞEN` и показывают суммы, например €3,00 и €1,00,
без объяснения:

- что именно сравнивается;
- откуда взялась каждая сумма;
- является ли это продажей, оплатой, складской корректировкой или ошибкой;
- какое действие должен совершить Owner.

Локализация формально присутствует после TASK-153, но смысл финансовой проверки
для Owner остаётся неясным.

## Цель

Заменить технические/неоднозначные labels на понятные business-copy и объяснение
контекста для каждой review карточки. Owner должен с первого взгляда понимать, что
означают «ожидалось», «зафиксировано», разница и конкретные €1/€3, почему карточка
появилась и нужно ли действие.

## Границы

- Owner-only read-only Reconciliation UI/copy и presentation technical references.
- EN/TR должны передавать один и тот же смысл, без неясных сокращений.
- Не менять ledger, payments, reconciliation calculation, audit records, RLS/RPC,
  automatic correction или historical staging data.

## Диагностика после завершения сбора багов Owner

- Проследить источник сумм из safe test fixture до каждой карточки: query/RPC field,
  ledger/payment/movement/audit category.
- Определить для каждого типа finding понятное business explanation и следующий
  безопасный action (например, review-only), не утверждая, что manual correction
  сама по себе является ошибкой.
- Проверить €0, отсутствующее ожидаемое значение, положительную/отрицательную
  разницу, long values и пустой/clean state.

## Критерии готовности

- Для значений вроде €1 и €3 Owner видит human-readable source и смысл суммы, а не
  только `Beklenen` / `Gerçekleşen`.
- Карточка объясняет, что именно требуется: review, no action или безопасный переход
  к деталям, без ложного тревожного статуса.
- EN и Turkish copy понятны, суммы/валюта и отрицательные/нулевые cases читаемы на
  mobile; technical references остаются on-demand.
- Существующая on-demand/Owner-only/accessibility behaviour TASK-153 сохранена.
- Targeted UI tests, `npm run build` и Owner physical confirmation проходят.

## Результат

- Диагностика подтвердила: €1/€3 в карточке manual stock correction были не
  деньгами, а `inventory_movements.quantity`; UI ошибочно форматировал все
  discrepancy values как EUR.
- Payment mismatch по-прежнему показывает EUR: «подтверждённая сумма продажи» и
  «принятые платежи». Stock findings теперь показывают `adet/items` с business
  labels, источником значения и безопасным next action.
- Manual correction явно объясняет, что это изменение количества товара, а не
  продажа/оплата, и что корректная adjustment не требует действия.
- Technical references остались on-demand, Owner-only lazy loading/accessibility
  TASK-153 сохранены; ledger, payments, calculations, audit, RLS и RPC не менялись.
- Evidence: targeted Vitest 5/5, demo/live production builds green. Physical Owner
  confirmation входит в consolidated TASK-165.
