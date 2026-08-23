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

## Production publication evidence — 2026-08-23

- The pre-mutation production dry-run listed exactly the approved eight migrations
  with no seeds or roles; the approved set was applied and the final dry-run returned
  `upToDate`.
- The earlier deployment was removed with explicit Owner permission after its build
  command forced demo mode. Follow-up RCs isolated two delivery causes: the Vercel
  project had no framework preset, and the custom Next `distDir` prevented the
  Vercel Next adapter from finding `.next`.
- The source-controlled remediation is `vercel.json` with `framework: "nextjs"` and
  a Vercel-only standard `.next` output directory. Local demo/live builds retain
  their separate output directories. The standard Supabase middleware is restored;
  no experimental middleware variant remains.
- Exact candidate `clothing-pilot-rc.18` / commit `9d0704b` is deployed to the
  production target and is `Ready`. Vercel reports the `nextjs` framework and
  publishes application functions rather than only middleware. Values, endpoints
  and credentials remain outside this record.
- Public unauthenticated smoke passed: `/` returns the expected `307` login
  redirect; `/login` and `/access-denied` return `200`; `/auth/callback` returns
  its expected `307`; and a deployed `/_next/static` JavaScript bundle returns
  `200`. The error-level deployment log query returned no errors.
- No test identities, Magic Links, inventory or business transactions were created.

### Remaining controlled checks

Vercel Deployment Protection has been disabled by the Owner, so application routes
are now reachable. Completion of TASK-150 still requires the separately controlled
TASK-084 Magic Link delivery/session matrix, minimal authorized Owner/Seller
boundary smoke, and an explicitly authorized reconciled transaction check. Do not
create identities, send login emails, load inventory or write business transactions
without the Owner's next instruction.
