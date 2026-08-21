# Production migration rehearsal — Clothing Pilot

Status: **completed on 2026-08-16 (TASK-085)**.

No project refs, connection strings, credentials, UUIDs, email addresses or real
catalog/stock data are recorded here (D-060).

## Evidence

- A clean local database applied all 29 repository migrations in timestamp order.
- The 14-file pgTAP suite passed all 175 assertions after that fresh reset.
- Owner linked the empty production project locally and entered the database password
  only into the interactive CLI prompt.
- A production `db push --dry-run` listed exactly those 29 migrations, with no seed
  or roles payload; the subsequent `db push` completed successfully.
- A final production dry-run reported `upToDate` and no pending migration. This proves
  that remote schema and `supabase_migrations` history agree.
- Local re-apply/rollback evidence remains the isolated TASK-082 restore rehearsal:
  recovery begins with the migration chain, then restores data into a separate
  environment. Production was not reset or restored during this task.
- Local post-migration checks passed: all four concurrency scenarios and the 26-case
  security/capacity smoke, including RLS denial, forged-token rejection, idempotency
  and five-user concurrent sales (359 ms median, 361 ms slowest; <5 s threshold).

## Controlled initial bootstrap

Do this only when Owner approves creation of the real initial identity, before pilot
data is loaded:

1. Owner signs in through the configured Magic Link and obtains the generated Auth
   user ID from the hosted dashboard.
2. Run the placeholder bootstrap snippet in `supabase/README.md`, replacing only
   `OWNER_PROFILE_UUID` locally in the SQL Editor.
3. Confirm exactly one active `owner` membership for `zebra-boutique`, then stop.
4. Do not create Sellers, catalog models, variants, receipts, stock, sales or images
   as part of this bootstrap.

## Recovery / rollback boundary

Migrations are forward-only. A bad schema change is corrected by a reviewed
compensating migration; a destructive production reset is forbidden. If data recovery
is ever needed, stop writes, restore into an isolated project from the encrypted
archive, apply migrations first, reconcile, and obtain Owner Go/No-Go before any
switch. See `ROLLBACK.md` and TASK-082 evidence.
