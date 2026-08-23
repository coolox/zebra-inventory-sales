# TASK-150 — Развернуть Release Candidate в production

Статус: IN PROGRESS

## Цель

Безопасно применить approved migrations и развернуть точный RC в production до загрузки реального inventory.

## Зависимости

TASK-149.

## Критерии готовности

- Production backup/rollback checkpoint подтверждён перед изменениями.
- Применён только approved migration set из TASK-149.
- Vercel deploy использует точный release tag/commit и production-only environment variables.
- Owner bootstrap и Zebra Boutique seed выполнены документированно без secret leakage.
- Auth, session, protected routes, live no-mock boundary и monitoring работают.
- Контролируемые receipt/sale/cancellation checks оставляют reconciled production state.
- Production ещё не открыт pilot users до успешного smoke.

## Тесты

- Production health/auth smoke.
- Minimal authorized Owner/Seller boundary smoke.
- Controlled transaction + audit/movement/payment/reconciliation verification.
- Rollback readiness re-check.
