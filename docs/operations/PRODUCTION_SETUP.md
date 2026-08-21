# Production resource baseline — Clothing Pilot

Status: **created empty on 2026-08-16 (TASK-083)**.

This file deliberately omits project refs, URLs, database passwords and API keys.
They are configuration values, not repository data (D-060).

## Isolation baseline

- `zebra-retail-production` Supabase project is separate from staging and is in
  AWS `eu-central-1` (Frankfurt).
- It is healthy and empty: no migrations, Auth users, Storage objects, branches or
  production application requests were introduced by TASK-083.
- Data API is installed; automatic table exposure is disabled and automatic RLS is
  enabled, matching D-043. Existing migrations remain the authority for explicit
  grants, policies and all current tables.
- `zebra-retail-production` Vercel project is separate from the staging project.
  It has no Git repository, no environment values, no Preview deployment and no
  Production deployment. No pilot user can reach an application from it.

## Hosted configuration rule

Never place values in `.env.example`, Git, task files, screenshots or chat. When the
corresponding launch task authorizes it, Owner enters the production values only in
Vercel **Production** environment management:

| Variable | Source / rule |
|---|---|
| `NEXT_PUBLIC_APP_MODE` | `live` only when a production deployment is explicitly authorized |
| `NEXT_PUBLIC_SUPABASE_URL` | Production Supabase project, never staging |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production Supabase publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production Supabase service-role key; server-only |
| `NEXT_PUBLIC_OBSERVABILITY_ENABLED` | Leave unset until Owner selects provider, retention and alert recipients |

The production database password is Owner-held. It is never requested, displayed or
stored by an agent. Managed secrets are verified by presence/scope only, never read.

## Handoff to later launch tasks

- TASK-084 configures production Auth, SMTP and redirect/Magic Link matrix.
- TASK-085 applies the migration rehearsal/bootstrap and proves hosted recovery.
- TASK-150 is the only task that connects Git/deploys the application and runs a
  production application smoke. Before it, the Vercel project remains intentionally
  empty.

## TASK-083 evidence

- Supabase dashboard: production project healthy, `eu-central-1`, no migrations and
  zero runtime requests/errors at the initial health check.
- Vercel dashboard: separate named project, `No Production Deployment` and `No
  Preview Deployments`; Git remains disconnected.
- Repository review: no project URL, password, API key or service-role credential was
  written during provisioning.
