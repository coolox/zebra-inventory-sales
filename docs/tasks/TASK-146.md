# TASK-146 — Синхронизировать Release Candidate migrations со staging

Статус: pending

## Цель

Доказать, что staging schema, RPC/RLS и live frontend соответствуют точному RC commit до manual acceptance.

## Зависимости

TASK-079, TASK-117, TASK-145.

## Критерии готовности

- Выполнен read-only inventory уже применённых staging migrations.
- Недостающие migrations применены строго в порядке после backup/rollback checkpoint.
- В staging присутствуют Seller summary, reporting, archive/barcode policy и остальные RC RPC/RLS версии.
- Live mode не использует mock fallback.
- Migration IDs и RC commit записаны без secrets/concrete credentials.

## Тесты

- Staging schema/migration diff.
- Owner/Seller RLS and RPC smoke.
- Sale/receipt/reconciliation sanity check.
- Live frontend health/auth smoke.
