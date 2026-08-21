# Production Go/No-Go review — Clothing Pilot

Статус: **NO-GO / BLOCKED**

Обновлено: 2026-08-20 (TASK-149).

Этот review не даёт права на production write. Только Owner может явно записать
решение `GO` после закрытия всех строк ниже.

## Проверенные факты

| Gate | Evidence | Статус |
|---|---|---|
| Isolated production projects | TASK-083: empty Supabase/Vercel projects созданы отдельно от staging | Ready |
| Schema rehearsal | TASK-085: recorded 29-migration dry-run → push → `upToDate`; no seed/data | Ready for the then-reviewed migration set |
| Recovery boundary | TASK-082: isolated restore 43/43 tables, 16/16 images; RPO 24h accepted in D-063 | Ready as rehearsal evidence |
| Rollback procedure | `ROLLBACK.md`: previous Vercel Ready promote; schema uses compensating forward migration | Documented |
| Security/capacity | TASK-148: local RLS/rate-limit/concurrency smoke recorded | Historical evidence only |
| Current release artifact | Current `HEAD` is `3d89ce2de1046abb2b6f66ee7d9473cf7a69ad1a`; worktree has uncommitted changes and no immutable tag | BLOCKER |
| Current frontend gates | TASK-164: targeted Playwright 9/9, targeted Vitest 13/13, repeated full Playwright 75/75 and demo build passed | Ready locally |

## Blocking conditions

1. TASK-084 remains partial: production Magic Link delivery, unknown-email and
   expired/reused-link acceptance has not been evidenced with controlled identities.
2. The remediation work is not yet committed, reviewed, tagged or deployed to a
   shared staging Preview; physical iPhone/Android acceptance remains outstanding.
3. No immutable release commit/tag and no approved final migration set exists for
   the release candidate.
4. Owner has not named the launch owner, database/deploy operator or incident
   contact, nor chosen a launch window, maintenance/communication plan and No-Go
   triggers.
5. Production monitoring provider, retention period and alert recipients are still
   unselected (see `OBSERVABILITY.md`).
6. Fresh production backup/alert evidence cannot exist until the production release
   and controlled bootstrap plan are authorized.
7. Owner has not recorded an explicit `GO` decision.

## Owner-approved path to a renewed review

Owner approved this order on 2026-08-20. It does not constitute `GO` and does not
authorize production writes:

1. TASK-164 closed all current browser-regression failures (completed locally).
2. TASK-165 creates one shared staging Preview from the reviewed remediation set and
   runs the short Owner/Seller walkthrough on physical iPhone and Android: login,
   receipt/Product code, product search/sale, stock adjustment, movement history,
   audit log and reports.
3. Every new defect becomes a small isolated task; after its fix, rerun only the
   affected tests plus the relevant staging check.
4. After a green staging walkthrough, create/review an immutable release artifact
   and return to TASK-149 for Owner Go/No-Go fields and explicit `GO`.
5. Only then may TASK-150 perform production deployment, followed by initial
   inventory and the controlled pilot.

## Required Owner record before GO

Record these fields in this document without credentials, personal contact details
or service secrets:

| Field | Required value |
|---|---|
| Release commit and immutable tag | Exact reviewed commit and tag |
| Approved migration set | Exact ordered migration IDs applied by TASK-150 |
| Launch owner / DB-deploy operator / incident contact | Role assignments (contact channel only, no personal data) |
| Monitoring | Provider, retention and alert recipient channel |
| Launch window | Istanbul date/time, maintenance notice channel and audience |
| No-Go triggers | Exact functional/security/reconciliation/alert thresholds |
| Backup freshness and rollback owner | Timestamp/checksum evidence reference and Owner confirming rollback authority |
| Explicit decision | `GO` signed by Owner after all gates are green |

## Safe dry-run review for TASK-150

Before any production mutation, the assigned operator reviews only these commands
locally against the already linked production project:

```bash
npx --yes supabase@2.113.0 db push --dry-run
npx --yes supabase@2.113.0 db push
npx --yes supabase@2.113.0 db push --dry-run
```

The first dry-run must list exactly the Owner-approved migration set; the final one
must report `upToDate`. Do not run `db reset --linked`. For a bad deployment,
promote the previous Vercel Ready deployment; for a bad migration, prepare a reviewed
compensating forward migration. Details: `ROLLBACK.md`.
