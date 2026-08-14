# TASK-147 — Провести полную staging acceptance matrix

Статус: pending

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
