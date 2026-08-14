# TASK-147 — Провести полную staging acceptance matrix

Статус: IN PROGRESS

## Цель

Проверить Release Candidate как реальные сквозные Owner/Seller сценарии и получить формальный staging exit decision.

## Зависимости

TASK-022, TASK-038, TASK-080, TASK-118, TASK-146.

## Критерии готовности

- Owner matrix: Auth, Seller management, receipt, images, FX, adjustment/count, archive, reports/exports, audit/reconciliation.
- Seller matrix: Auth boundary, catalog, receipt, per-item/total sale, mixed payment, cancellation, exchange и sales summary.
- Проверены unknown/expired/reused link, blocked Seller, cross-store, insufficient stock, duplicate request и network error.
- Проверены desktop/tablet/mobile, English/Turkish, Light/Dark и reload после mutations.
- Нет открытых P0/P1; P2/P3 имеют owner и решение defer/fix.
- Все созданные staging test records помечены и reconciled/cleaned безопасно.

## Тесты

- Documented manual staging matrix с evidence.
- Targeted automated staging smoke, где он не создаёт опасные данные.
- Reconciliation report до и после matrix.

## Выполненная часть acceptance 2026-08-15

- Linked staging migration history совпадает с local: 29 IDs, включая
  `20260815120000`; новые staging mutations не создавались.
- Owner live workspace доступен после reload; архивированный TASK-118 fixture
  не показывается в обычном Inventory, а `AS123` отображается с canonical `Blue`.
- Owner reconciliation прочитан повторно. `missing_sale_movement = 0` и
  `negative_balance = 0`, но обнаружены release-blockers ниже.

## P1 reconciliation blocker — ожидает решения Owner

Четыре `confirmed` sale имеют captured payments `€0` при expected total `€640`:

| Sale ID | Expected EUR | Models |
|---|---:|---|
| `15f1627e-6f57-4a3a-aa7c-99ea61cffaaa` | 550 | AS12, USD123 |
| `bf7077f4-4156-4c13-a2ed-aeb99861d564` | 40 | AS12 |
| `cb5e56b8-b7e0-44d4-9456-edfaf20317d7` | 30 | AS12 |
| `d827138c-c6b3-4880-bba6-05771b647dce` | 20 | AS12 |

Все имеют audit context `sale.confirmed:web`, но не содержат маркировки test
fixture. Поэтому агент не может скрытно выбрать remediation:

1. если это staging test sales — Owner подтверждает audited cancellation всех
   четырёх с причиной `TASK-147 staging cleanup`;
2. если хотя бы одна sale должна остаться confirmed — Owner указывает
   документированный payment snapshot/способ корректировки; agent не создаёт
   payment records по догадке.

Также найдены 11 `manual_correction` записей уровня `review`: это не ledger
error, но для staging exit Owner должен пометить их как ожидаемые fixtures или
назначить отдельную корректировку. Пока нет решения по P1 и review records,
TASK-147 остаётся `IN PROGRESS` и staging exit не выдан.
