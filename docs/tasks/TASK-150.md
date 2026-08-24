# TASK-150 — Развернуть Release Candidate в production

Статус: COMPLETED

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
- The first Owner Magic Link request was safely rejected by Supabase with `Signups
  not allowed for otp`. This proves the application has not silently created an
  unauthorised production identity: the initial Owner Auth user must be created by
  the Owner in the production Supabase dashboard before passwordless login can be
  requested. This is an identity-bootstrap prerequisite, not an SMTP or Vercel
  delivery failure.
- A later retry after the Owner ran the bootstrap returned the same Auth error.
  Vercel confirms that all required variables are scoped to `Production`, but their
  values are intentionally unread. The Owner must compare the production Supabase
  Project URL with `NEXT_PUBLIC_SUPABASE_URL` in Vercel and verify the Auth user in
  that exact project before any environment edit or redeploy.
- After the production public variables were corrected and redeployed, Magic Link
  delivery succeeded. The clicked link then returned to `/login` without any
  observed `/auth/callback` request in Vercel. This indicates Supabase ignored the
  requested callback redirect and used its configured Site URL; production Auth URL
  Configuration must contain the exact stable `/auth/callback` URL before a fresh,
  single-use link can be tested.
- Owner-authorized dashboard remediation completed: the selected production branch
  now has the stable Vercel alias as Auth Site URL and the exact `/auth/callback`
  URL in its redirect allow-list. Existing link templates are Supabase defaults;
  a new single-use Owner link is required to evidence the callback/session result.
- Subsequent live-workspace diagnosis proved that the Vercel public Supabase
  variables had been changed to the separate staging project. That database ends at
  migration `20260815120000`, so RC.18 correctly refuses to substitute demo data
  when its live queries fail. The CLI-linked `zebra-retail-production` database was
  independently verified `upToDate` through `20260822120000`; do **not** apply
  migrations to staging. Its Auth Site URL and exact production callback allow-list
  are now configured. Vercel must be restored to that production project's URL and
  publishable key, then redeployed; values remain unrecorded and unread.
- After the restored deployment, the next Magic Link request reached production Auth
  but returned `Error sending magic link email`, not an unknown-user error. A fresh
  retry more than an hour later returned the same `500` delivery failure. Production
  has custom SMTP enabled and Supabase warns that the configured personal-mail
  provider is not delivery-grade. This is a persistent SMTP delivery/configuration
  blocker, not a rate limit: the Owner must replace the SMTP credential with a valid
  app password or move production mail to a transactional provider before one fresh
  single-use link is tested. Do not retry in a burst.
- The Owner subsequently updated the production custom SMTP sender configuration
  without disclosing credentials. A fresh Owner Magic Link was delivered, its
  callback completed, and the live application opened. This establishes production
  mail delivery plus the Owner callback/session path; the user-confirmed evidence
  does not authorize further mutation checks.
- Owner live-boundary smoke was then confirmed in the authenticated workspace:
  Zebra Boutique loaded as live data with an empty, zero-inventory state; protected
  Dashboard, inventory, sales history, reports and the Owner-only Seller management
  dialog were reachable. The dialog reports no Seller memberships yet. No fallback
  demo data or load error appeared.
- Owner-authorized production Seller invitation was submitted through that protected
  dialog. The application confirmed email dispatch and shows one active Seller
  membership. Personal contact details and invitation credentials are intentionally
  absent from this evidence. Seller login and least-privilege UI verification remain
  pending the Seller's single-use link completion.
- Seller completed the single-use login and verified the live Zebra Boutique
  workspace, session persistence after refresh, Seller product/sale access, and the
  absence of Owner-only Team, Audit Log and reconciliation surfaces. No stock or
  monetary action was performed during this role-boundary smoke.
- No unapproved identities, real inventory or real business transactions were created
  by this task; the only production identity change was the Owner-authorized Seller
  invitation, and the later RC150 records are the explicitly authorized smoke trace.

### Controlled transaction smoke — 2026-08-24

- With explicit Owner authorization, one isolated product code prefixed `RC150` was
  received as one EUR-denominated unit, sold once for EUR 2 through the web UI, and
  then cancelled with a documented smoke-test reason. Sale history showed the
  cancelled ticket, the interim stock restoration, and reports returned to zero
  revenue, margin, receipts and units after cancellation.
- The restored test unit was reduced by one through an Owner-audited stock adjustment
  with an explicit cleanup reason, then the zero-stock RC150 model was archived.
  Active inventory consequently returned to `0 units / 0 SKU`; the archived test
  model preserves only the required historical trace and cannot be sold.
- Owner Audit Log recorded receipt confirmation, sale confirmation, sale cancellation,
  stock adjustment and product archive in order. Reconciliation displayed the
  expected manual-adjustment review item (not a payment or stock mismatch), with the
  recorded transition `1 → 0`; this is intentional cleanup evidence.
- This smoke created no real customer sale, real inventory, or untracked monetary
  balance. Existing backup/rollback checkpoint evidence remains unchanged.

### Completion — 2026-08-24

- TASK-084 subsequently completed the full production Magic Link delivery, redirect,
  unknown/non-member, reused-link and expired-link matrix.
- Together with the Owner/Seller boundary smoke and the reconciled RC150 transaction
  trace above, every TASK-150 acceptance check is complete. The production workspace
  contains no active real inventory; the controlled Seller is provisioned, but the
  Clothing Pilot is not open.
- No further production action is authorized by this task. Initial real inventory is
  the separate TASK-087 owner-controlled step.
