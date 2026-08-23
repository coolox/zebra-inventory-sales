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

## Production attempt — 2026-08-23

- The pre-mutation production dry-run listed exactly the approved eight migrations
  with no seeds or roles; the approved set was applied and the final dry-run returned
  `upToDate`.
- The original deployment was removed with explicit Owner permission after its build
  command forced demo mode. Replacement RC tags `clothing-pilot-rc.2` and
  `clothing-pilot-rc.3` exposed the build and Edge-bundling fixes; only
  `clothing-pilot-rc.4` / commit `dbab2c6` is the Ready production candidate.
- The Vercel deployment of `clothing-pilot-rc.4` / `dbab2c6` is Ready; values,
  project endpoints and credentials remain outside this record.
- Unauthenticated smoke of root, `/login` and `/auth/callback` receives Vercel SSO
  `302` protection before the application. This blocks Magic Link callback and
  application authentication for Owner/Seller. No test identities, Magic Links,
  inventory or transactions were created.

### Current blocker

Owner must decide whether to disable Vercel Deployment Protection / Vercel
Authentication for the production deployment so the application login and allowed
Supabase callback can be reached by pilot users. Do not continue TASK-084 Auth
acceptance or TASK-150 transaction smoke while the Vercel SSO redirect remains.
