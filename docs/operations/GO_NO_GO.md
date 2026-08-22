# Production Go/No-Go review — Clothing Pilot

Статус: **NO-GO / BLOCKED**

Обновлено: 2026-08-22 (TASK-149 release-record intake).

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

## Owner inputs recorded — 2026-08-22

These inputs narrow the release decision, but do not change the current `NO-GO`.
Personal email addresses and credentials are intentionally not stored in Git.

| Field | Recorded value | Status |
|---|---|---|
| Monitoring | Vercel Logs with Vercel built-in notifications | Chosen; retention is the current Vercel-plan default, accepted by Owner |
| Alert recipient / incident channel | Owner-controlled Vercel account email notification channel | Chosen; address held outside Git |
| Launch owner | Owner-designated launch owner | Chosen; identity held outside Git |
| Business owner | Additional Owner-designated business approver | Recorded; not a substitute for deploy operator |
| Seller participant | Owner-designated Seller for pilot validation | Recorded; not a launch-operations role |
| Incident contact | Launch owner through the Owner-controlled email channel | Chosen; address held outside Git |
| Proposed launch window | 2026-08-22, 15:20 Europe/Istanbul | Recorded; requires final confirmation that the window is still future/approved immediately before `GO` |
| Database/deploy operator | Owner-designated database/deploy operator | Arslan; identity/contact held outside Git |
| Backup freshness | Recovery rehearsal and RPO 24h are documented; fresh production backup evidence is not available before production bootstrap | **BLOCKER for GO** |
| RC commit / immutable tag | Local annotated `clothing-pilot-rc.1` points to `a95ee4bc3968e272227d148f2c3e1db246859b48`; GitHub tag-only push is blocked by HTTP 400 and remote verification is empty | **BLOCKER** |
| Approved migration set | Repository chain has 37 files; safe production dry-run confirmed that the remote already has 29 and would apply exactly the 8 files below, with no seed or roles | Ready for final Owner approval |

### Production migration dry-run — 2026-08-22

The non-mutating dry-run listed this exact ordered set. It must be the only set
applied by TASK-150, followed by a final `upToDate` dry-run:

1. `20260820120000_update_product_model_code.sql`
2. `20260821130000_lock_existing_receipt_model_identity.sql`
3. `20260821140000_reporting_seller_email_fallback.sql`
4. `20260821150000_model_current_purchase_cost.sql`
5. `20260821160000_sale_line_image_snapshot.sql`
6. `20260821170000_safe_product_image_removal.sql`
7. `20260821180000_owner_cash_report.sql`
8. `20260822120000_preserve_receipt_color_canonicalization.sql`

### Environment presence check — 2026-08-22

The separate `zebra-retail-production` Vercel project has exactly the required five
variable names in Production scope: live app mode, production Supabase URL,
publishable key, server-only service-role key and observability enabled. Their values
were not opened or recorded. A fresh deployment is still required for them to take
effect.

### Immediate NO-GO triggers — Owner approved 2026-08-22

Do not proceed to TASK-150 if any of the following is true:

- production Magic Link delivery, unknown/non-member denial, or expired/reused-link
  behaviour has not passed the TASK-084 acceptance matrix;
- the production migration dry-run differs from the approved ordered list, or any
  required verification gate fails;
- the RC commit, immutable tag and reviewed staging artifact do not match;
- no fresh backup/recovery evidence and rollback authority are confirmed;
- Vercel monitoring/notifications are unavailable, retention is unknown, or the
  designated recipient cannot receive an alert;
- an open P0/P1, security boundary failure, or unexplained reconciliation
  discrepancy exists;
- the launch owner, database/deploy operator, incident channel, or approved
  launch window is absent.

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
