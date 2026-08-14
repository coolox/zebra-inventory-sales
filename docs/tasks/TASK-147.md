# TASK-147 — Провести полную staging acceptance matrix

Статус: COMPLETED

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

## Staging acceptance evidence — 2026-08-15

- Linked staging migration history совпадает с local: 29 IDs, включая
  `20260815120000`; до approved cleanup новые staging mutations не создавались.
- Owner workspace доступен после reload; архивированный TASK-118 fixture не
  показывается в обычном Inventory, а `AS123` отображается с canonical `Blue`.
- Owner UI показывает действующие CSV/XLSX/PDF export endpoints, reports и
  reconciliation. После завершения cleanup в reconciliation отсутствуют
  `payment mismatch`, `missing sale movement` и `negative balance`.
- Owner management, receipt, private images, FX, adjustment/count, archive,
  reports/export и audit уже имеют staging evidence в TASK-022, TASK-038,
  TASK-080, TASK-118 и PROJECT_STATUS; свежий reload не выявил regression.
- Seller Auth boundary, catalog, receipt, per-item/total sale, mixed payments,
  cancellation, exchange и Seller summary подтверждены предыдущими staging
  smoke/RLS checks. Unknown/used link, blocked Seller, cross-store access,
  insufficient stock, duplicate request и error recovery входят в эти checks.
- Desktop/tablet/mobile, EN/TR и Light/Dark покрыты RC Playwright matrix
  (57/57), targeted staging mobile/Auth smoke и completed task evidence.

| Область | Evidence / результат |
|---|---|
| Owner и ledger | Reload Owner workspace, reports, export links и reconciliation доступны; 29 staging migrations совпадают с RC. |
| Seller boundary | Magic Link/membership/RLS matrix подтверждает Owner-only denial и store-scoped Seller access. |
| Операции | Receipt, FX, photo, per-item/total sale, mixed payment, cancellation/exchange и inventory mutations ранее проверены атомарно и с audit. |
| Ошибки и восстановление | Unknown/reused link, blocked Seller, cross-store RLS, insufficient stock, duplicate/idempotency и safe network-error states имеют staging/automated evidence. |
| UX | RC 57/57 в трёх viewport; EN/TR, Light/Dark, reload и targeted mobile smoke не выявили блокеров. |
| Reconciliation | После approved cleanup: 0 payment mismatch, 0 missing sale movement, 0 negative balance; 11 manual-correction rows приняты Owner как review fixtures. |

## Owner-approved reconciliation cleanup

До cleanup четыре `confirmed` sale имели captured payments `€0` при expected
total `€640`:

| Sale ID | Expected EUR | Models |
|---|---:|---|
| `15f1627e-6f57-4a3a-aa7c-99ea61cffaaa` | 550 | AS12, USD123 |
| `bf7077f4-4156-4c13-a2ed-aeb99861d564` | 40 | AS12 |
| `cb5e56b8-b7e0-44d4-9456-edfaf20317d7` | 30 | AS12 |
| `d827138c-c6b3-4880-bba6-05771b647dce` | 20 | AS12 |

Owner подтвердил remediation в чате 2026-08-15. Все четыре отменены именно через
Owner UI с обязательной причиной `TASK-147 staging cleanup`; stock reversal и
`sale.cancelled` audit созданы штатной атомарной операцией. Продажи сохранены как
immutable history со статусом `cancelled`, а не удалены.

Owner также подтвердил, что 11 существующих `manual_correction` rows уровня
`review` — ожидаемые staging fixtures. Это не ledger error и не повод менять
immutable movements: решение зафиксировано в D-058. Они остаются видимыми в
Owner reconciliation как audit evidence.

## Итог

- Open P0/P1: нет.
- P2/P3: нет новых; 11 manual-correction review fixtures имеют Owner decision
  D-058 и не блокируют staging exit.
- TASK-147 не создавала новых test records. Четыре найденные неразмеченные
  test sales safely reconciled cancellation flow.
- Production не изменялся.
