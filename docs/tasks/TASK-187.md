# TASK-187 — Завершить Turkish localization Audit Log без показа технических labels

Статус: COMPLETED

Приоритет: P1 — Owner Audit Log в Turkish locale смешивает EN copy и database-like
identifiers, поэтому журнал непонятен в ежедневной работе.

Источник: Owner physical mobile screenshots, 2026-08-21.

## Наблюдение

При включённом Turkish locale заголовок и category chips переведены, но в Audit Log
остаются English labels:

- `All actors`, `All entities`, `Date`;
- `source`, `pricing mode`, `web`, `per_item`;
- entity/action-like values `inventory_count`, `product_model`, `purchase_receipt`,
  `sale`, `sale_exchange`, `sale.confirmed`.

Технические identifiers не должны быть единственным содержимым Owner-facing списка
или select options. Они не объясняют операцию обычному пользователю.

## Цель

Дать полный понятный Turkish Audit Log: filters, options, list rows, metadata,
empty/loading/error/pagination/technical details. События и entities отображаются
как business-language labels; stable raw identifier остаётся доступен только
on-demand, если нужен для support/audit traceability.

## Границы

- Только Audit Log copy/mapping/presentation; EN остаётся согласованным.
- Не менять immutable audit records, event taxonomy, query/RPC, pagination,
authorization, RLS или server-side actor/entity filters.
- Не переводить/изменять stored database values и не скрывать essential evidence.

## Критерии готовности

- Turkish locale не показывает `All actors`, `All entities`, `Date` или raw
  entity/action identifiers в обычной UI surface.
- Owner понимает, кто совершил действие, с каким объектом, что произошло, когда и
  какие безопасные metadata (`source`, pricing) означают.
- Raw identifier при необходимости виден только в labelled expandable technical
  reference и не ломает filter selection/value mapping.
- All category/entity/date states, pagination/filter reset TASK-159, mobile select
  overlays and EN regression проходят.
- Targeted Turkish/EN UI tests, `npm run build` и Owner mobile recheck проходят.

## Результат

- Audit Log теперь мапит known action/entity identifiers на business labels EN/TR:
  `sale.confirmed` → «Satış onaylandı», `purchase_receipt` → «Ürün kabulü» и т.д.
- Turkish filters переведены: «İşlemi yapan», «Tüm işlemi yapanlar», «Kayıt»,
  «Tüm kayıt türleri», «Tarih». Их stable internal values и reset/pagination
  behaviour не менялись.
- Безопасные metadata labels/values также переведены (`source`/`web`,
  `pricing_mode`/`per_item`). Raw action/entity/UUID остаются только внутри
  закрытого «Teknik referans»; email, token и прочие sensitive details исключены
  и оттуда.
- Evidence: targeted Audit UI/data tests 7/7 и demo/live production builds green.
  Physical Owner mobile confirmation входит в consolidated TASK-165.
