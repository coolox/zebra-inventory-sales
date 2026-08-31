# Changelog

## Unreleased

- TASK-213 completed: pre-publication audit separates code-ready remediation
  fixes from delivered staging evidence. The next staging build is scoped to
  PWA, camera, Logout, resilient product photos and FX UI; Turkish invoice AI
  receiving and label-assisted sales remain unimplemented post-pilot task chains.

- TASK-211 completed: added a protected server-only TCMB sync Edge Function,
  idempotent service-only rate writer, three-business-day carry-forward policy,
  Owner-visible sync health and a post-publication GitHub schedule with bounded
  retry. Staging/production publication and secret setup remain explicitly gated.

- TASK-210 completed: `exchange_rates` now has validated provider, basis, source
  date, fetched time, status and carry provenance. Existing manual rates safely
  remain audited Owner overrides, the rate manager makes provenance visible, and
  Seller writes remain denied; clean local pgTAP (10/10) and demo/live builds pass.

- TASK-209 completed: added a strict, pure TCMB daily-XML parser for the approved
  `Döviz Satış` basis. It rejects malformed or incomplete provider payloads and
  normalizes EUR/USD/TRY to the existing EUR-base rate contract before any future
  database write; 8 unit tests and demo/default production builds pass.

- TASK-208 completed: an unavailable private product-photo signed URL no longer
  aborts the live catalog/workspace. Successful photos remain visible, while core
  database/RLS errors stay explicit and never receive demo fallback.

- TASK-207 completed: live Logout now clears both the server SSR session and the
  browser Supabase session, has a four-second fallback, blocks duplicate clicks
  and always replaces the page with a clean login route. Targeted auth tests and
  demo/live builds pass; physical account-switch recheck remains in TASK-088.

- TASK-204 completed: Owner accepted the Turkish Zebra Retail sales landing.
  The mobile product dashboard now fits the viewport without clipping or
  artificial empty space; Sites version 5 is published and returns HTTP 200.

- TASK-087 completed: initial Zebra Boutique inventory was entered exclusively
  through production live receipts (18 models, 118 variants, 122 units). Owner
  physical reconciliation reports no discrepancies; a sampled variant retains
  its confirmed receipt movement.

- TASK-084 completed: production Magic Link SMTP/template and one exact callback
  redirect are verified; Owner/Seller delivery, non-member denial, reused-link and
  expired-link checks all preserve the safe no-session boundary.

- TASK-150 completed: production RC.18 (`9d0704b`) uses Vercel's Next.js framework
  preset and standard Vercel `.next` output. Public routes, Owner/Seller Auth,
  role boundaries and a reconciled receipt/sale/cancellation smoke are green; no
  active test inventory remains.

## 2026-08-23

- TASK-202 completed: manual production backup run `32607243580` created
  `production-2026-08-23.tar.gz.age`; the encrypted archive passed VPS-side
  SHA-256 verification before promotion to the isolated 14-day daily retention
  path. No migration, Vercel deploy, Auth-user creation or pilot-data write ran.

## 2026-08-22

- TASK-202 started: a manual-only production backup checkpoint workflow uses a
  separate `PRODUCTION_*` secret namespace, encrypted `production` VPS path and
  checksum-before-promotion boundary. No production credential, backup artifact,
  migration, deploy or pilot data was created; Owner secret setup and the first
  successful run are required before TASK-149 can resume.

- Recorded TASK-192 from Owner local-demo visual intake: Turkish greeting must be
  `Merhaba {name},` while `Zebra Boutique · bol satışlar!` remains the only sales
  wish. No code, staging or production change is authorized until Owner closes
  the renewed intake.

- Recorded TASK-193—TASK-195 from Owner light-theme screenshots: action controls
  blur enabled/disabled/loading meaning, selected Audit categories lose readable
  foreground, and the Sale Flow duplicate/out-of-stock warning is nearly invisible.
  These are isolated presentation tasks; no code or staging/production change is
  authorized until Owner closes the renewed intake.

- Recorded TASK-196 from Owner local-demo Sale Details screenshot: the existing
  historical image boundary does not currently demonstrate photo-first seller
  recognition because the line renders only a neutral placeholder. Thumbnail and
  fullscreen acceptance, including demo coverage, are deferred until intake closes.

- Recorded TASK-197 from Owner Product Details screenshot: `Sell this product` must
  be the first primary action, while Product code and approved model details move
  into one Owner-only Edit Product entry point below it. Server-side audit and exact
  confirmation boundaries remain unchanged; implementation waits for intake close.

- TASK-191 completed: consolidated remediation release gates are green (Vitest
  243/243, Playwright 78/78, demo/live builds, lint 0 errors, fresh pgTAP 214/214,
  concurrency and 27 security/capacity checks). Cash export route mocks and the
  mobile drawer locator were corrected. Forward migration `20260822120000` restores
  canonical receipt colours without weakening existing-model identity lock.
  Handoff guides now use only `PROJECT_STATUS.md`; TASK-165 is the sole next gate.

- Synchronized completed TASK-173 and TASK-181: the light-theme Receive Flow
  add-colour action has its implemented enabled/disabled affordance (13 targeted
  tests passed), and the existing responsive EN/TR Arslan Ram footer attribution is
  now recorded with its approved no-external-link boundary.

- Corrected the project pointer: TASK-186 was already completed with historical
  private sale-image snapshots, Sale Details thumbnail/fullscreen fallback and
  Sales History 8/8. All TASK-170—TASK-189 are now recorded complete; TASK-165 is
  the consolidated acceptance gate.

- TASK-172 completed: light-theme Sales Trend no longer uses heavy grey empty bar
  backgrounds. Transparent hit areas, a subtle lavender grid and soft purple hover
  preserve dark-theme hover plus tap, keyboard focus and pinned-value behavior;
  6 targeted tests and demo build passed.

## 2026-08-21

- TASK-178 completed: Owner can confirm, cancel and retry private product-photo
  removal; horizontal carousel swipe preserves vertical scroll, keyboard controls
  and viewer gestures. The Owner/store-scoped audit RPC protects historical sale
  image snapshots. UI tests 17/17, pgTAP 8/8 and demo build passed.

- TASK-177 completed: Owner Edit Product now centrally updates model name, gender,
  low-stock threshold and current purchase cost/currency. The server-side RPC is
  Owner/store-scoped and audited; historical receipt, sale, FX and ledger evidence
  remains immutable. UI tests 15/15, pgTAP 8/8 and demo build passed.

- TASK-189 completed: dashboard KPI values no longer truncate money or sale counts
  at supported 320–430 px widths or 150% text zoom. Targeted Vitest, mobile
  Playwright regression and build passed; Redmi evidence is consolidated in TASK-165.

- TASK-165 remains in progress: Owner confirmed the iPhone Safari/PWA install path
  in TASK-180. The final shared Owner/Seller device walkthrough is intentionally
  held for a reviewed consolidated Preview after the remaining remediation tasks.

- TASK-180 completed: Owner confirmed supported Safari Home Screen installation,
  installed-PWA launch and working iPhone flow. PWA manifest and login branding use
  Zebra Boutique,
  while standalone scope/start URL and approved icons remain intact. Invalid or
  expired Magic Links have covered EN/TR recovery states. A Ready live Preview was published at
  `https://zebra-inventory-sales-kb56dzquv-cooloxs-projects.vercel.app`; staging
  Auth Site URL and one exact callback were updated to it, retaining eight exact
  redirect URLs and leaving Production unchanged.

- TASK-169 completed: staging Auth Site URL and exact callback now point to the
  consolidated Preview. Owner and Seller each completed the fresh same-browser
  Magic Link path to workspace and logout back to login; no sensitive link data
  was recorded.

- TASK-185 refined: English Seller headline is now `Hello {name},`, while the
  supporting `Zebra Boutique · good sales!` line remains. Turkish greeting stays
  `Merhaba {name}, bol satışlar!`.

- Consolidated staging Preview published: reviewed non-secret snapshot built in
  live mode and deployment `dpl_zyGtZsejdKXsc8JFRnD5egVYNXX9` is Ready at
  `https://zebra-inventory-sales-eli6hmy56-cooloxs-projects.vercel.app`.
  Public login smoke confirmed Zebra Boutique and Magic Link without creating a
  session or changing staging data, Auth configuration, Supabase or Production.

- TASK-170 completed: controlled Product code and sale amount fields now ignore a
  late Android input event after keyboard dismissal, while preserving normal IME
  composition. The boundary covers Receive/Sale code, item and total price, and
  mixed-payment amount. Targeted Receive/Sale tests passed 24/24 and the demo
  build passed.

- TASK-188 completed: Owner Reports now has a Cash/Kasa tab showing captured
  ledger payments by method and original currency, with period, count, CSV and
  print. The server-side Owner-only report excludes cancelled/reversed sales and
  labels the result as non-physical cash; XLSX/PDF exports include a Cash section.
  Cash pgTAP passed 4/4, report/export tests passed 6/6, and the demo build passed.

- TASK-187 completed: Turkish Audit Log now renders business labels for filters,
  actions, entities and safe metadata. Raw IDs remain only in closed technical
  reference; email, tokens and other sensitive metadata remain hidden. Targeted
  Audit tests (7/7) and demo/live builds passed; physical Owner verification is
  in TASK-165.

- TASK-174 completed: Reconciliation now distinguishes EUR payment comparisons
  from stock quantities. Owner sees source-specific labels, meaning and a safe
  review action on EN/TR; manual adjustments no longer display as €1/€3. Ledger,
  payments, calculations, audit, RLS and RPC were unchanged. Targeted Vitest
  (5/5) and demo/live builds passed; physical Owner verification is in TASK-165.

- TASK-182 completed: Owner Seller reports now use display name, then approved
  account email, before a clearly explained genuine historical unknown fallback.
  The reporting RPC never returns another actor's email to a Seller caller.
  Targeted Vitest (5/5), clean local pgTAP (3/3), and demo/live builds passed;
  physical Owner verification is batched into TASK-165.

- TASK-171 completed: exchange writes already preserved top-ups atomically, but the
  live workspace discarded persisted exchanges on reload. It now loads exchange,
  source/replacement and payment snapshots, so Sales History exposes the linked
  top-up and final ticket total. Targeted tests (16/16), exchange/report pgTAP
  (37/37), and live build passed; physical €100→€170→€70 evidence is in TASK-165.

- TASK-175 completed: adding a colour now locks existing Product code, name, brand,
  category, supplier, shared barcode and gender; only variant/receipt fields remain
  editable. A new receipt migration also ignores tampered existing-model payload
  fields and supplier data server-side. UI tests (16/16), clean pgTAP (5/5), and
  demo/live builds passed; Redmi validation is batched into TASK-165.

- TASK-176 completed: Edit Product now reports success only after the audited
  Product code RPC returns the exact requested value. Empty/mismatched responses
  remain an explicit error; all variants retain their model UUID, barcode, photos
  and ledger/history. UI tests (15/15), pgTAP authorization/audit tests (11/11),
  and demo/live builds passed; Redmi confirmation is batched into TASK-165.

- TASK-183 completed: Owner KPIs and Seller Summary use distinct, server-authorized
  read models; Seller cards keep Store/My scope explicit. A late summary response
  could overwrite a newer post-sale snapshot, so the newest request now wins and
  successful-update time is visible. Targeted UI/model tests (8/8) and demo/live
  builds passed; the controlled two-session staging comparison remains in TASK-165.

- TASK-179 completed: live Sales History used elapsed 24-hour offsets, so Istanbul
  `23:40` and `00:11` sales could both appear as Today. A shared Istanbul business
  calendar now drives live sales, History filters, demo Reports and Audit date
  filtering. Targeted Vitest passed 15/15, local Seller Summary pgTAP passed 20/20,
  and demo/live builds passed; physical Redmi 14 midnight acceptance remains in the
  consolidated TASK-165 walkthrough.

- TASK-190 completed: Owner closed bug intake. TASK-170—TASK-189 are now a fixed
  remediation scope with an explicit data-first dependency order, per-task evidence
  locations, one consolidated staging Preview, physical iPhone/Redmi acceptance,
  renewed Go/No-Go and separate Production authorization. TASK-169 is deferred to
  the consolidated Preview; TASK-179 is the only next task.

- Recorded TASK-189 from Owner's Redmi 14 dashboard screenshot: large KPI values are
  truncated as `€10.4…` and `101 a…`. The P1 responsive presentation follow-up will
  show full currency/count values without altering calculations or TASK-183 scope;
  no design or code change starts during bug intake.

- Recorded TASK-188: Owner requested an Owner-only `Kasa`/Cash Reports dimension
  for cash and transfer receipts by currency, period and print/export. The later
  read-only financial design will distinguish ledger-derived payments from physical
  cash count; no database/API/export/code change starts during bug intake.

- Recorded TASK-187 from Owner's Turkish Audit Log screenshots: filters still show
  English and rows expose raw entity/action and metadata identifiers. The P1
  follow-up will add readable business-copy mapping while preserving immutable audit
  evidence, filters and pagination; no copy/mapping/code change starts during bug
  intake.

- Recorded TASK-186: Owner requested a compact thumbnail for every sold item in Sale
  Details, with a fullscreen preview. The later work will preserve private/RLS access
  and prevent historical sale photos breaking after current-gallery deletion; no data
  strategy, design or code change starts during bug intake.

- Recorded TASK-185: Owner requested replacing the Turkish dashboard greeting's
  fixed shift-open time with `Merhaba {name}, bol satışlar!`; the later localized
  presentation update will not change user/session logic. No copy or code change
  starts during bug intake.

- Recorded TASK-184 from the mobile Exchange Flow walkthrough: the native list of
  all store variants is unclear. The P1 follow-up will use Product code lookup, then
  model colour and available size selection, while preserving atomic exchange and the
  separate TASK-171 payment-difference boundary; no code change starts during bug
  intake.

- TASK-183 evidence upgraded to a confirmed P1 mismatch: after one new sale and
  refresh, same-minute mobile screenshots show €2,002/16 and €2,085/17 — exactly
  €83 and one sale apart. The cause is not yet assumed; live data/scope/role
  diagnosis waits for the Owner to finish bug intake.

- Recorded TASK-183 from Owner's revenue comparison: screenshots show €1,802/15 at
  13:39 and €1,885/16 at 13:57, so one later €83 sale can explain the difference;
  the page described as Seller also exposes Owner controls. The P1 follow-up will
  verify role, scope and same-snapshot freshness before changing calculation; no
  diagnosis or code change starts during bug intake.

- Recorded TASK-182 from the Reports walkthrough: Owner's own sales appear as
  `Unknown seller` in Seller dimension. The P1 follow-up will use display name, then
  approved email, with an explained genuine-unknown fallback and Owner-only privacy
  boundaries; no diagnosis or code change starts during bug intake.

- Recorded TASK-181: Owner requested a professional, unobtrusive Arslan Ram creator
  attribution in the web app and installed PWA. The later presentation follow-up
  will use approved EN/TR copy and placement without unapproved links or impact on
  retail operations; no design or code change starts during bug intake.

- Recorded TASK-180 from the Owner iPhone install attempt: a third-party Shortcut
  does not support downloading the staging site and displayed a safe `otp_expired`
  Auth summary. This does not prove a Safari PWA failure; the later follow-up will
  verify the supported Safari Home Screen path and fresh/expired same-browser Magic
  Link recovery. No Auth setting or code changes start during bug intake.

- Recorded TASK-179 from the physical Sales History walkthrough: the Turkish
  `Bugün` filter mixes before-midnight sales with safe `00:11`/`00:27` sales, while
  the latter were treated as the previous day. The P1 follow-up will align Istanbul
  business-date handling in sale creation, history, reports and audit; no diagnosis
  or code change starts during bug intake.

- Recorded TASK-176—TASK-178 from the physical Product Details walkthrough:
  Edit Product cannot save a changed Product code; Owner wants threshold moved from
  the ordinary card into an audited Edit Product flow alongside gender/name/purchase
  cost; and mistaken private product photos must be removable safely. The findings
  remain split across code-save regression, data-edit scope and Storage/RLS deletion;
  no diagnosis or code change starts during bug intake.

- Recorded TASK-175 from the physical Receive Flow walkthrough: “Add colour” still
  permits changing an existing model's gender, Product code, name and brand. The P1
  follow-up will lock model identity and validate it server-side while allowing only
  an eligible new colour/receipt variant; no diagnosis or code change starts during
  bug intake.

- Recorded TASK-174 from Owner's Turkish Reconciliation screenshot: labels
  `Beklenen` / `Gerçekleşen` and €1/€3 values do not explain the source, meaning or
  required Owner action. The later read-only presentation follow-up will clarify
  financial context without changing calculations; no code change starts during bug
  intake.

- Recorded TASK-173 from the physical walkthrough: the enabled light-theme Receive
  Flow action “save this item and add another colour” looks disabled. The later
  presentation fix will make its enabled state clearly actionable while retaining
  the primary Save hierarchy; no code change starts during bug intake.

- Recorded TASK-172 from Owner's mobile light-theme screenshot: the prominent grey
  background of Sales Trend bars visually competes with the purple revenue values.
  The presentation-only follow-up will modernize that surface while retaining
  TASK-157 accessibility/interaction; no design or code change starts during bug
  intake.

- Recorded TASK-171 from the physical walkthrough: after a safe €100 sale is
  exchanged for a €170 item, Sales History shows €170 but does not explicitly show
  the €70 top-up. The P1 finding requires later reconciliation of exchange UI,
  payment/ledger, audit and reports. Per Owner instruction, no diagnosis or fix has
  started while bug intake continues.

- Recorded TASK-170 from the physical Android walkthrough: on Redmi 14, pressing
  the system keyboard-dismiss arrow vibrates and appends an unexpected character
  to the active input (`100` → `1004`; `SS55` → `SS55Q`/`SS55И`). This is a P1
  regression finding linked to TASK-163 and blocks TASK-165 device acceptance.
  Per Owner instruction, no diagnosis or fix has started while bug intake continues.

## 2026-08-20

- TASK-165 physical finding: Owner Magic Link from the Ready Preview returned to
  login. The Ready Preview origin is not the documented exact staging Supabase Auth
  callback; TASK-169 owns the isolated staging-only redirect update. No email,
  token, full link, Production or secret was recorded/changed.

- TASK-168 completed: replaced the final unauthenticated login `ZB` tile with the
  existing Zebra Boutique PWA mark and added a targeted asset assertion. Targeted
  login test, demo/live builds and the Ready live Preview safe smoke pass; no Magic
  Link, Production, Supabase, Auth URL, Vercel configuration or secret was changed.

- TASK-167 completed: Vercel blocked the first staging Preview only because its
  temporary local snapshot used invalid artificial Git author metadata. Republishing
  the same reviewed files without `.git` metadata required no Vercel settings change;
  the live-mode Preview is Ready and shows the Magic Link login. Safe smoke found an
  unauthenticated login `ZB` brand remnant, tracked separately in TASK-168.

- TASK-165: approved non-secret remediation snapshot created a separate staging
  Preview, but Vercel blocked it before build/runtime; public URL confirms the
  block and request logs are empty. No Production/Supabase/Auth URL/secret mutation
  occurred. Follow-up TASK-167 owns the external deployment blocker; no device
  walkthrough was started.

- TASK-166 completed: replaced the former `ZB` navigation mark and Android/iOS PWA
  install icons with a Zebra Boutique zebra mark based on the Owner-provided logo.
  Manifest/navigation tests (3/3), demo production build and whitespace check pass;
  staging and production were not changed.

- TASK-164 completed: fixed the Adjust Stock modal stack so Product Details no
  longer intercepts selected-size interaction, and scoped two stale desktop/tablet
  `Seller` smoke selectors to the header role control after Reports introduced its
  own Seller dimension. The seven reproduced failures are closed: targeted
  Playwright 9/9, targeted Vitest 13/13, repeated full Playwright 75/75 and demo
  production build pass.

- TASK-163 completed: Receive Flow now preserves Product code through blur and
  Enter/Done/Go keyboard dismissal, commits IME input only after composition ends,
  and rejects control/invisible suffixes with explicit EN/TR validation instead of
  silently rewriting identity. Targeted tests passed 14/14 and demo production build
  passed. Receive Flow browser smoke passed in all supported viewports; physical
  iPhone/Android evidence remains for the shared staging Preview walkthrough.

- TASK-162 completed: Product Details now exposes an Owner-only EN/TR edit action
  limited to Product code. The new atomic audited Supabase RPC preserves model and
  variant UUIDs, barcode, photos and the receipt/sale/inventory ledger, rejects
  Seller/cross-store/blank/duplicate requests, and records old/new code. Targeted
  ProductCard Vitest passed 13/13 and the demo production build passed. The local
  clean reset applied 30 migrations; the existing pgTAP harness remains blocked
  before assertions by its stale Auth test schema. Staging and Production were not
  changed.

## 2026-08-18

- TASK-161 completed: ReportsDashboard now fully localizes EN/TR title, export actions, KPI, dimensions, table, loading/empty/error states and dynamic fallback labels. Locale switching preserves report period, dimension and loaded data. Full Vitest passed 214 tests and demo/live builds passed.

- TASK-160 completed: Adjust Stock now requires an explicit product/colour size selection, clears a draft delta when the size changes, and previews before/delta/after for the chosen variant. Existing Owner-only atomic RPC, RLS and audit protections remain unchanged. Full Vitest passed 213 tests and demo/live builds passed.

- TASK-159 completed: Audit Log resets to page 1 for category, actor, entity and date changes. Pagination is disabled outside ready non-empty boundaries, and stale page responses cannot replace a newer filter result. Full Vitest passed 211 tests, demo/live builds passed, and targeted Audit Log browser smoke passed 3/3 viewports.

- TASK-158 completed: Movement History now uses a centered safe-area mobile dialog with viewport-capped internal scrolling for long lists. Background scroll is locked/restored and focus returns to the selected variant’s History trigger. Full Vitest passed 208 tests, demo/live builds passed, and targeted browser layout smoke passed across desktop, tablet and mobile.

- TASK-157 completed: Sales Trend bars are accessible touch/keyboard controls. Tap pins the exact daily EUR revenue in a compact value row with explicit close; €0, hover, focus and EN/TR accessible labels are covered. Full Vitest passed 203 tests, demo/live builds passed, and targeted Playwright passed 3/3 viewports. Manual devices remain part of shared Preview acceptance.

- TASK-155 completed: Owner added the staging server-only `SUPABASE_SERVICE_ROLE_KEY` directly to Vercel Preview (value was not read); the invitation route now records a redacted diagnostic stage without exposing configuration to the client. Controlled invitation acceptance remains part of the shared remediation Preview.

- TASK-154 completed: Reports Low stock now shows a compact summary by default and
  an explicit on-demand full list. Responsive cards replace the long table, while
  EN/TR loading, empty, error and retry states keep an error distinct from an
  all-clear state. Full Vitest passed 200/200, ESLint has 0 errors, demo/live builds
  passed, and Playwright passed 66/66. Deployment remains batched for shared staging
  acceptance; Production was not changed.
- TASK-153 completed: Owner Reconciliation is now an on-demand, read-only
  reconciliation check rather than a default long table. It does not call the RPC
  until opened, supports refresh/hide, uses responsive cards and fully localized
  EN/TR copy; manual corrections are explicitly marked for review, not proven errors.
  Full Vitest passed 198/198, ESLint has 0 errors, demo/live builds passed, and
  Playwright passed 63/63. Deployment remains batched for shared staging acceptance;
  Production was not changed.
- TASK-152 completed: Owner Inventory now always exposes an `Archived products` /
  `Arşivlenmiş ürünler` control with a model count. The responsive archive view has
  explanatory empty, success and error states plus explicit open and restore actions;
  failed restore requests cannot present a false success. Full Vitest passed 196/196,
  ESLint has 0 errors, demo/live builds passed, and Playwright passed 60/60 across
  desktop, tablet and mobile. Deployment remains batched for the next shared staging
  acceptance cycle; Production was not changed.

## 2026-08-17

- TASK-156 completed: Sales History now groups all lines of one sale into a single
  ticket, shows one sale-level total and exposes exact line totals in details.
  Unit/integration, TypeScript, lint, demo/live builds and Playwright 57/57 passed;
  the Owner confirmed the fix on the updated staging Preview. Staging Supabase Auth
  points to that Preview, while Production remained unchanged.
- Owner requested batching the remaining walkthrough fixes before the next manual
  Magic Link verification because email delivery is limited. Remediation will still
  follow the one-task workflow, beginning with TASK-152, then publish a combined
  staging candidate for acceptance.

## 2026-08-16

- TASK-085 completed: owner-linked empty production database received all 29 tracked
  migrations through Supabase CLI after an exact dry-run; final remote dry-run is
  `upToDate`. Fresh local reset passed 14 pgTAP files/175 assertions; concurrency and
  26-case security/capacity smoke passed (361 ms slowest five-user sale). Added
  `MIGRATION_REHEARSAL.md`, production CLI guardrails and UUID-free initial Owner /
  Zebra Boutique bootstrap. No seed, Auth user, catalog, stock, deployment or secret
  was introduced.
- TASK-083 completed: Owner-approved cleanup removed the unrelated paused Supabase
  project and freed the Free slot. Created separate empty production Supabase in
  `eu-central-1` with Data API enabled, automatic table exposure disabled and
  automatic RLS enabled; its initial health check is clean with no migrations or
  requests. Created a separate empty Vercel project with Git/environment variables/
  Preview/Production deployments intentionally absent. Added `PRODUCTION_SETUP.md`
  and kept all refs, URLs, database passwords and keys out of Git.
- TASK-148 completed: added the repeatable `supabase:security-smoke` and Local
  Supabase CI gate. Signed-JWT PostgREST probes denied anonymous, unknown, blocked,
  forged-token and cross-store access; Seller direct writes and Owner-only RPCs were
  refused, while permitted Seller/Owner paths remained available. Five concurrent
  sales completed with a 317 ms median and 323 ms slowest time (<5 s threshold),
  idempotency created no duplicates and ledger reconciliation stayed clean. Session
  and Seller administration rate-limit tests now verify normal-flow allowance and
  `429`/`Retry-After`; staging Preview Owner smoke loaded protected live data without
  a write.
- TASK-082 completed: the verified staging backup was restored into an isolated local
  Supabase stack. All 43 `auth` + `public` tables and 16 private images reconciled;
  Owner/Seller RLS RPC smoke passed and the documented rollback plan now carries the
  Owner-accepted 24-hour RPO (D-063). Hosted recovery and production rollback remain
  deliberately deferred to TASK-085/TASK-150; D-062 records `rls_auto_enable` as a
  non-blocking, unregistered safety net outside the RC.
- TASK-082: restore rehearsal executed against the verified
  `staging-2026-08-15.tar.gz.age` artifact in an isolated local stack. All 43 `auth`
  and `public` tables reconciled with zero mismatches, 16 images restored with zero
  orphans and byte-identical `sha256` round-trip, Owner RPCs returned the expected
  volumes and the Seller was correctly denied reconciliation. The 11 reconciliation
  rows match the D-058 fixtures, confirming business state and not just row counts.
- TASK-082: documented four defects in the naive restore path — `roles.sql` fails on
  its final privilege GRANT, `data.sql` collides with the migration-created storage
  bucket, internal `storage` tables deny writes even to `postgres`, and a load without
  `--single-transaction` leaves the database partially populated. Storage is instead
  restored by re-uploading mirrored files, which is safe because `storage_path` is a
  text path rather than an object foreign key. Added `RESTORE.md` and `ROLLBACK.md`.
- TASK-082: found staging schema drift and recorded D-062. Function `rls_auto_enable`
  exists on staging but nowhere in the repository, with no event trigger referencing
  it. Inspection showed it is an unfinished RLS auto-enable safety net rather than
  junk, and it cannot be invoked directly; its absence weakens nothing because all 21
  tables get RLS explicitly from migrations.
- TASK-082: corrected D-062 before acting on it. It had claimed role
  `statement_timeout` values were staging-only drift that a production project would
  miss; a clean database straight after migrations already has `anon` at `3s` and
  `authenticated` at `8s`, so they are Supabase platform defaults. The planned
  migration was not needed and was not added.
- TASK-082: corrected D-061. Its original rationale about cluster-global event
  triggers was wrong; the decision now rests only on `on_auth_user_created`, verified
  as absent from the dump and created by migrations.
- TASK-081 completed: Owner confirmed a second copy of the `age` identity is held
  off the workstation, closing the last open item. Retention over 14 daily copies
  remains observable only after two weeks of scheduled runs and is recorded as a
  standing limitation rather than a blocker. Pointer moved to TASK-082.
- TASK-081: first accepted staging backup artifact. `Staging backup` run
  `31911881685` succeeded after the rsync SSH-pinning fix; the 20 MiB encrypted
  archive was checksum-verified on the VPS, re-verified locally, decrypted with
  the real `age` identity and structurally reconciled (21 tables/21 RLS policies,
  32 functions, 3 triggers, 49 sales, and a 16 ↔ 16 match between
  `storage.objects` rows and mirrored image files). Access-control review found
  no `sudo`, no `/root` access and no contact with the legacy bot.
- TASK-081: fixed per-backup directories being created `775` instead of `700`;
  the second remote `mkdir` ran without `umask 077` and `rsync --chmod` does not
  change an existing destination directory. Files were already `600` and the
  `700` parent prevented exposure.
- TASK-081: recorded that `on_auth_user_created` and the `rls_auto_enable` event
  trigger are absent from `supabase db dump` by design, so restore must apply the
  migration chain first. Captured as required input for TASK-082.

## 2026-08-15

- TASK-081: second manual backup run completed encrypted DB/Storage preparation
  but stopped before transfer because `rsync` did not inherit the already-pinned
  SSH key/known-hosts options. Added an escaped `rsync -e` command generated from
  the same strict SSH options; shell/YAML/pinning fixture checks pass. Final
  publication and evidence run remain pending; VPS content is unchanged.
- TASK-081: added a password-preserving IPv4 pooler compatibility path after
  the first Actions run exposed GitHub runner's direct-IPv6 limitation. The
  existing DB URL is transformed only in runner temp storage to the verified
  staging Transaction Pooler endpoint; its password is never logged, read or
  committed. Shell/YAML/fixture/guard validation passes; re-run remains pending.
- TASK-081: after Owner-approved push to `main`, manual GitHub Actions run
  `Staging backup #1` failed before producing an archive because the staging
  database Secret uses a direct IPv6 host and GitHub runner has no IPv6 route.
  VPS/Storage were untouched. The corrective action is to replace only that
  secret with the staging project's IPv4 Transaction Pooler URL, then rerun.
- TASK-081: Owner added the private backup SSH key to GitHub; agent added the
  fingerprint-verified public ED25519 known-hosts line and confirmed all twelve
  required secret names. Values remained unread. The backup workflow remains
  local pending explicit `main` publish approval because that push creates a
  Vercel production deployment.
- TASK-081: Added the four non-key VPS repository secrets (`HOST`, `PORT`,
  `USER`, `PATH`) through the Owner GitHub session without opening any existing
  secret values. The only remaining VPS secret inputs are Owner-controlled SSH
  private key and independently pinned public known-hosts line.
- TASK-081: Owner locally installed the existing public key into isolated
  `zebra-backup`; SSH verification confirms it can write only to the closed
  archive area and not `/root`. After finding exactly one marked temporary root
  authorization, agent removed that entry. VPS access is now least-privilege;
  the next gate is the GitHub Secret set and first encrypted-artifact run.
- TASK-081: after verified host identity and Owner-controlled root access, created
  the isolated `zebra-backup` account plus closed staging archive directories on
  the Owner VPS. Read-only verification confirms no supplementary groups, mode
  `700` for account/archive paths and `600` for its empty authorized-keys file.
  The legacy bot/service/SQLite data were untouched; only Owner can install the
  existing public backup key, after which temporary root authorization is removed.
- TASK-081: Owner-supplied ED25519 fingerprint exactly matched the public key
  scanned from the backup VPS. The subsequent pinned, read-only SSH login was
  rejected by server authorization; passwords and private keys were neither
  requested nor inspected, and the VPS remains unchanged. A temporary,
  Owner-controlled access path is the only blocker before the isolated backup
  user can be created.
- TASK-081: Owner-authorized Contabo panel confirmed the backup VPS endpoint;
  the address is deliberately kept out of Git and reserved for the GitHub Secret.
  A read-only SSH probe reaches host-key verification, but no ED25519 host key
  was previously pinned, so no VPS login or mutation occurred. Completion now
  awaits independent fingerprint verification before dedicated backup-user setup.
- TASK-081 VPS access check was intentionally read-only. The historical `contabo` name is not a configured SSH alias and does not resolve in DNS, so no remote connection or mutation occurred; keys, passwords and VPS files were not read. Completion now awaits the exact Owner-scoped hostname/IP and port for the dedicated backup user bootstrap.
- TASK-081 accepted Owner Plan B: an isolated GitHub Actions workflow now prepares daily encrypted logical Postgres and `product-images` backups for the Owner VPS, with checksum verification and 14-day retention. Added a root-run VPS bootstrap for the dedicated non-privileged `zebra-backup` user; it does not touch the legacy bot, its SQLite data or service. The task remains in progress until Owner creates the new access/secrets and one manual run yields fresh artifact evidence.
- TASK-081 assessed the real staging backup boundary. Supabase Dashboard confirms the staging project is Free Plan with no scheduled database backups or artifacts; native database backups also exclude Storage objects, so `product-images` needs its own encrypted off-site mirror. Added `docs/operations/BACKUP.md` with required retention/access policy and two safe implementation options. The task is blocked only on Owner choice of plan/automation and private archive location; no secrets or production resources were accessed.
- Completed TASK-147 full staging acceptance. Owner approved and executed cancellation of four test sales through the audited Owner UI with reason `TASK-147 staging cleanup`; the immutable sales history and stock reversals remain intact. The final Owner reconciliation has 0 payment mismatch, 0 missing sale movement and 0 negative balance. Owner accepted the 11 existing manual-correction review rows as expected staging fixtures (D-058), so no ledger history was rewritten. Production was not changed; TASK-081 backups is next.
- TASK-147 began its fresh staging acceptance pass. Migration history is synchronized at 29 IDs and Owner reload confirms TASK-118 cleanup in Inventory. Reconciliation has no missing sale movements or negative balances, but reports four confirmed sales with €640 expected/captured €0 plus 11 manual-correction review records. The task remains in progress awaiting an Owner decision; no staging records were changed and Production was not touched.
- Completed TASK-118 staging color cleanup. Owner-approved fixture `TASK021-FX-BOUNDARY` was reversibly archived through the Owner flow, preserving 4 movements, 2 receipt lines and 2 sale lines; no physical delete occurred. Migration `20260815120000` adds server-side canonical receipt colours and normalized exactly 13 audited staging variants with audit records. Reconciliation confirmed fixture inactive, 13/13 canonical colours, zero active temporary markers and preserved ledger; Inventory reload hides the fixture and shows `AS123` as Blue. Clean local 29-migration pgTAP passes 14 files/175 assertions, concurrency and demo build pass. Production was not changed.
- TASK-118 staging read-only audit completed without changing data. Fixture model `TASK021-FX-BOUNDARY` has two `Boundary EUR/USD` variants and zero ledger balance, but four movements, two receipt lines and two sale lines, so deletion is unsafe and only reversible archive is proposed. Thirteen `mavi`/`siyah`/`Bej` legacy variants across `AS123`, `USD123` and `XX123` have no canonical `(model, size, color)` collisions and are eligible for a separately approved transactional normalization. TASK-118 remains in progress pending the Owner's exact choice; Production was not changed.
- Completed TASK-038 staging Seller status acceptance. Owner UI changed a staging Seller from active to blocked and back to active, with the opposite action shown after each request; the Seller was restored before completion. At 390×844 the Seller dialog kept status/action within its own bounds without horizontal overflow or console errors. Seller component suites pass 4 tests and the live build passes; production was not changed.
- Completed TASK-022 staging product-image acceptance. An Owner uploaded fresh JPEG, PNG and WebP repository fixtures to a previously photo-less live product; carousel navigation reached 2/3 and still showed 1/3 after reload. Unsupported MIME and a 9 MiB PNG were rejected before Storage upload. Earlier private bucket/RPC/RLS and cross-store-denial evidence remains valid; no production resources changed. Product-image/Product Card suites pass 15 tests and the live build passes.
- Completed TASK-080 safe observability. Added opt-in, provider-neutral structured client/server error capture, a redacting global error boundary, Node instrumentation and a bounded rate-limited endpoint available before sign-in. Sale, receipt and Magic Link failures now carry only safe operation/correlation context. Full local suite passes 80 files/187 tests; demo/live builds and lint (0 errors) pass. A Vercel Preview synthetic event returned 204 and runtime logs retained environment/operation/path while redacting the synthetic email and Bearer value. Preview-only observability was enabled; no production resources, real transactions or Magic Link emails were changed.

## 2026-08-14

- Completed TASK-146 staging RC migration synchronization. A schema-only public checkpoint was created before change; 17 verified historical migrations missing only from remote history were repaired as applied, then exactly eight RC migrations (barcode/archive, reporting/reconciliation, Seller summary and code-first identity) were applied. Staging now has all 28 local/remote migration IDs and a zero-change dry-run. Owner/Seller RPC/RLS smoke, Seller denial of Owner-only reconciliation, sale/receipt RPC sanity and live no-mock health pass. Production was not changed; managed backup/restore remains TASK-081/TASK-082.
- Completed TASK-079 separate staging frontend. A clean archive of `main` RC `81701be` is deployed as a Vercel Preview at `https://zebra-inventory-sales-51z34xyje-cooloxs-projects.vercel.app` with live-only Preview variables pointing to staging Supabase; no values were read or committed. Staging Site URL and `/auth/callback` allow-list now match this Preview. Protected-route/login/session and 390 px mobile no-overflow smoke pass with no console errors; no Magic Link email was sent. Production resources were not configured or changed.
- Completed TASK-145 Clothing Pilot Release Candidate. Code RC `f838f78680b4fb5a18fd5600f194ec5defd335a6` passed local lint (0 errors), demo/live builds, 75 Vitest files/177 tests, Playwright 57/57, clean 28-migration Supabase suite (13 pgTAP files/169 assertions) and all concurrency conflicts. GitHub Actions run `31822493717` is green for Frontend and Local Supabase; the reviewed branch was merged into `main`. Staging and production were not changed; TASK-079 is next.
- Completed TASK-144 targeted EN/TR release pass. Supplier Manager now has localized controls and safe localized errors; Supplier and Count Owner controls were restored from an unreachable legacy block into the active Inventory header. FX entry/base/close labels and Inventory unit labels are localized, state survives locale switches, and Owner/Seller local desktop/mobile smoke passes without mobile horizontal overflow. Full 75-file/177-test suite, demo/live builds and lint (0 errors) pass; staging/production were not changed.
- Completed TASK-117 code-first product identity hardening locally. Product codes are now non-blank and normalized store-unique while preserving stored leading-zero/alphanumeric values; UUIDs remain the only inventory/history references. Receipt now separates an optional shared model barcode from an optional per-colour/size supplier barcode, and raw QR URI/card payloads are rejected pending a decode-and-validate scanner flow. The new migration retains existing barcodes and has clean local evidence: 28 migrations, 13 pgTAP files/169 assertions, 173 frontend tests, lint with 0 errors, and demo/live builds pass. Staging and production were not changed.
- Restored the database release gate by correcting the Seller sales-summary pgTAP fixture to satisfy the required cancellation snapshot, without weakening RLS or assertions. A clean local reset passed all 27 migrations, 13 pgTAP files/162 assertions and the three concurrency conflicts; GitHub Actions run `31816406792` is green for both Frontend and Local Supabase checks on commit `8c5c81f`.
- Stabilized the frontend release gate: replaced interactive `next lint` with pinned ESLint 9 flat-config tooling and added it to CI, made the axe modal check wait for the final animation state, and documented `tmp/` as ignored local visual-QA output without deleting existing files. Lint has 0 errors, 172 frontend tests and demo/live builds pass, and two consecutive full Playwright runs pass 57/57 without retries.
- Added an explicit cross-chat handoff protocol: `PROJECT_STATUS.md` is the single current-task pointer, `ROADMAP.md` tracks every launch step as DONE/NEXT/WAITING/PARTIAL/BLOCKED, and Owner starts one task with `Выполни TASK-NNN`. Agents mark the task IN PROGRESS before work, record evidence on completion, advance exactly one pointer and stop until the next explicit command.
- Replaced the stale implementation roadmap with one audited Clothing Pilot launch plan. Existing completed task files remain historical evidence; AI receipt, Telegram, AI labels and multi-store are explicitly post-launch. Added TASK-142—TASK-151 only for genuine release gaps: frontend/database gates, remaining EN/TR, RC freeze, staging migration/acceptance, security capacity smoke, Go/No-Go, production deploy and pilot closure. The audit records 172 frontend tests, 57 browser checks, 27 migrations and 162 SQL assertions, and correctly marks current-head CI as frontend-green/database-red rather than reusing an older green run.
- Added a compact Seller-only sales summary to the dashboard: live store today/week plus personal today/week/month/year/all-time EUR revenue and units. It uses the protected TASK-140 RPC only, never substitutes demo sales data, refreshes after sale/cancellation/exchange workspace updates, and includes EN/TR loading, empty and retry states. Owner reports remain separate. 172 frontend tests, build and Seller desktop/tablet/mobile smoke pass; staging/production were not changed.
- Added a secure Seller sales-summary RPC: active-store today/week aggregates and personal today/week/month/year/all-time EUR revenue and units. It derives personal attribution from `auth.uid()`, excludes cancelled sales, reconciles exchange top-ups to the source sale and uses Istanbul/Wed–Tue business periods. Local Supabase/RLS, 168 frontend tests and production build pass; staging/production were not changed.
- Added compact private-model photo thumbnails and purchase cost to Inventory rows for Seller and Owner. Items without photos now have an accessible localized placeholder; Product Card continues to show only the non-persisted sell-price reference. Full unit/build and desktop-tablet-mobile smoke coverage passes.
- Recorded the Owner decision to add private-model thumbnails and purchase cost in Inventory while keeping purchase cost out of Product Card, plus a server-authorized Seller sales summary: store today/week and personal today/week/month/year/all-time totals. Work is split into TASK-139—TASK-141.
- Confirmed that Product Card sell price remains a non-persisted `purchase cost × 3` reference; Seller may still enter the actual sale price for each transaction.
- Configured the staging Magic Link Preview: Vercel Preview now uses live mode with the matching build command/output directory, and Supabase Site URL plus callback allow-list target the working branch Preview while retaining localhost development callback.
- Disabled Vercel Authentication for the staging Preview so mobile Magic Links reach Zebra rather than the Vercel sign-in page; unauthenticated HTTP check of the staging login returns 200.
- Completed staging Magic Link verification: Owner and invited Seller sign in through separate accounts, unknown email is denied, used links do not authenticate again, and logout/refresh retains the membership boundary; Owner confirmed the mobile flow.
- Completed GitHub Actions CI verification on the public repository: the final remote run passes frontend build/unit/component/desktop-tablet-mobile smoke plus clean local Supabase migrations, RLS and concurrency checks. The workflow now starts its isolated Supabase stack explicitly; responsive test selectors and report-table keyboard access were corrected.
- Isolated local demo/live Next.js modes with explicit mode selection and separate `.next-demo`/`.next-live` output directories. Added safe mode-specific commands, a production hydration console assertion and clean sequential Chrome smoke; demo and live both load without hydration diagnostics.
- Added a server-side validation and rate-limit boundary for Seller invitation, Seller access changes and session reads. Malformed/oversized external payloads are rejected before privileged actions; API errors use safe domain codes without exposing provider/RPC messages or client PII. Full Vitest suite passes 165/165 and production build passes.

## 2026-08-13

- Published the GitHub Actions CI workflow and created the first remote run. GitHub blocked it before jobs began because the account billing is locked; TASK-078 remains in progress pending Billing & plans resolution and a green rerun.
- Audited task accounting across all 138 TASK files: restored completed TASK-041/042 to `PROJECT_STATUS`, documented the remaining UI smoke boundary for TASK-038 and the fresh-upload/negative-smoke boundary for TASK-022.
- Added a store-scoped Owner audit-log query with normalized event categories, safe actor-name mapping, stable filters/pagination and RLS cross-store coverage.
- Added a GitHub Actions CI pipeline: production build, unit/component tests, deterministic desktop/tablet/mobile Playwright smoke, clean Supabase migrations/RLS checks and concurrent inventory harness run separately without production secrets.
- Added the Owner Audit Log UI: filters for category/actor/entity/date, pagination and safe operation details; Seller remains limited to Activity rather than audit data.
- Added Owner-only XLSX reports export with a typed Summary and requested Breakdown worksheet, real Excel date/money cells, formula-prefix neutralization, filter parity and server authorization coverage.
- Added persistent demo sale-exchange snapshots: a positive top-up now increases Overview/report revenue, chart and Seller ranking while keeping one ticket/unit; margin replaces the returned item's cost, and Sales History shows the replacement and final ticket total.
- Fixed demo exchange payment options to show each currency's actual FX-equivalent top-up before selection. Demo Owner Reports now derive from local sales, cancellations, exchanges and inventory and refresh after those changes; Seller no longer sees the empty Owner-only Reports block.
- Added local-only real concurrent inventory transaction harness for sale/sale, sale/adjustment and sale/exchange conflicts; each clean run proves one rejection and non-negative ledger balances.
- Added Owner-only reconciliation report for payment mismatches, missing sale movements, negative balances and manual inventory corrections, including source IDs, RLS, clean-ledger coverage and Reports UI states.
- Added Owner-only PDF report export with compact landscape metrics/breakdown layout, store/period/generated timestamp, long-table pagination, UI action and authorization coverage.
- Added Owner/Seller sales-history filters for seller, status and Wednesday–Tuesday business period. Filters persist in URL query state; unit/component and direct-link browser coverage pass.
- Added store-scoped EUR reporting metrics RPC and typed loader. Confirmed sales, cancelled reversals and exchange top-ups reconcile through local pgTAP RLS fixtures; staging and production were not changed.
- Added Istanbul business-date reporting periods: Today, Wednesday–Tuesday week, month, year and validated custom ranges. The inclusive `{ from, to }` contract now reaches the reporting RPC and loader.
- Added store-scoped Seller, supplier, brand, model and category report breakdowns. EUR totals reconcile with the primary report; archived entities remain visible in historical results.
- Added ledger-derived inventory reporting by model/variant: historical balance, sold units, sell-through, turnover and configured low-stock status, with zero-safe calculations.
- Added Owner Reports at `/reports`: responsive metrics, period filters, dimension drill-down and low-stock table with live loading/error states.
- Added Owner-only UTF-8 CSV export for summary, breakdown and inventory reports, with filter parity, RFC 4180 escaping and formula-injection neutralization.

## 2026-08-11

- Added staged-ready inventory count documents with atomic, idempotent adjustment reconciliation and an Owner count form.
- Added Owner supplier directory create/edit/archive UI and auditable supplier RPCs that preserve historical receipts.
- Added store/model low-stock policies, real-balance query, Owner threshold control and policy-aware attention carousel.

## 2026-08-12

- Added Exchange UI from confirmed per-item sale history: in-stock replacement picker, clear top-up/no-refund policy, native-currency payment confirmation and live/demo refresh. Applied exchange migration to staging; €10 top-up smoke confirmed paired movements, payment snapshot, audit and idempotent replay. Production was not changed.
- Added atomic exchange ledger/RPC: source-sale-line traceability, locked `exchange_in`/`exchange_out` stock movements, native top-up payment snapshots and required audit/reason. Cheaper/equal exchanges never create refunds or credits; full local pgTAP (114 checks) passes. Staging and production were not changed.
- Added reason-required Cancellation UI for confirmed sales, with focused mobile confirmation dialog, localized loading/error/success states, live workspace refresh and demo stock reversal. Applied the audited cancellation migration to staging; authenticated smoke confirmed sale status/reason/timestamp, exact stock reversal, reversed payments and audit record. Production was not changed.
- Normalized Receive Flow colour chips across case and known English/Turkish synonyms, localized labels, and hid legacy boundary/currency test labels without modifying staging data.
- Added a server-only Owner Seller invitation boundary with audited, idempotent membership activation; staging email delivery remains opt-in.
- Applied Seller invitation migration and Owner safety guard to staging; live Owner form successfully delivered a test invitation email without exposing the server secret to the browser.
- Added an audited, idempotent Owner-only Seller deactivate/reactivate backend and protected status API; migration applied to staging and blocked memberships lose store access through existing RLS/session checks.
- Localized login, access-denied and Magic Link callback flows in English/Turkish, persisted locale across authentication redirects and removed technical auth-error details from user messages.

Все существенные изменения проекта фиксируются здесь. Формат — краткий результат, не список каждой строки кода.

## 2026-08-11

### Added

- Добавлена безопасная Owner-only inventory adjustment: отдельное signed ledger movement с обязательной причиной, transaction lock, запретом отрицательного balance, idempotency и audit before/after. Для Owner добавлена форма `Adjust stock` из выбранного variant; migration применена точечно на staging.
- В карточке товара добавлен `Movement history`: выбранный color/size variant открывает адаптивный диалог с количеством (+/−), типом операции, автором, причиной и Istanbul timestamp. Предусмотрены loading, empty, error/retry и Escape close; вложенные dialog исключены.
- Добавлен data-слой истории движений inventory: store/variant-scoped query читает audit ledger, присоединяет actor и нормализует receipt/sale/adjustment/exchange/transfer/write-off/cancellation для будущего UI карточки товара.
- Добавлено обратимое archive/restore модели товара: только Owner своего магазина может изменить `is_active`, операция аудируется, архивная модель остаётся в receipt/sale/inventory history и не может быть продана даже stale/direct запросом. Владелец видит отдельный список Archived и может восстановить модель.
- Зафиксирован code-first inventory: обязательный `Product code / Ürün Kodu`, internal UUID и полностью optional barcode, который можно добавить позже без изменения stock/history.
- AI-приёмка разложена на пошаговые TASK-089—093 и TASK-117—123: private document draft, OCR contract, catalog matching, variant reconciliation, review, atomic confirm, idempotency, color cleanup и hydration isolation.
- AI-продажа по фото этикеток разложена на TASK-124—130: private camera/batch upload, label extraction, in-stock matching, review, cart integration, atomic sale и security/mobile E2E coverage.
- Barcode lookup технически добавлен в live catalog, Inventory search, Sale и Receive, но оставлен необязательной неактивной возможностью до пересмотра identity schema в TASK-117.
- В ручной приёмке появился необязательный barcode: он сохраняется в demo draft и передаётся как `p_model.barcode` в live receipt RPC без AI/OCR.
- Добавлены mock barcode `869000990200` для модели `KM-9902` и `…201`–`…204` для её вариантов, unit search tests и component tests Sale/Receive barcode input.

### Verified

- `npm run test`: 66/66; `npx tsc --noEmit`, `npm run build` и `git diff --check` проходят. Добавлены form и pgTAP atomicity/RLS/idempotency tests adjustment; staging smoke `+1/-1` вернул stock к исходным 3 и оставил 2 movements/2 audit records. Production не изменялся.
- `npm run test`: 64/64; `npx tsc --noEmit`, `npm run build` и `git diff --check` проходят. Browser smoke подтверждён для desktop и 390×844 mobile в чистом demo production build.
- `npm run test`: 59/59; `npx tsc --noEmit` и `npm run build` проходят. Добавлены unit mapper tests и pgTAP RLS fixture истории движений.
- `npm run test`: 57/57; `npm run build` проходит. Новый pgTAP набор Owner/Seller/audit/sale guard добавлен, но local Supabase CLI в этой среде не вернул финальный вывод — повторить перед staging apply.
- `npm test -- --run`: 55/55; `npx tsc --noEmit`, `npm run build` и `git diff --check` проходят.

### Fixed

- Устранено расхождение SSR и первого client render в `Home`: live-режим теперь включается после hydration, а стартовый workspace shell детерминирован. Это убирает Recoverable Hydration Error при разной runtime-конфигурации server/browser; production build проходит.
- Архивирование в demo больше не требует database UUID: все варианты модели меняют статус по общему Product code, поэтому кнопка Archive работает и до подключения live Supabase.
- Local demo browser smoke: Inventory находит четыре варианта по `869000990200`; Sale сохраняет picker color → size; Receive находит `KM-9902` и переносит barcode в draft. Staging не изменялся.

## 2026-08-10

### Added

- Добавлена barcode migration: один case-insensitive barcode принадлежит одной модели или варианту в пределах магазина, с lookup indexes, cross-table concurrency guard и pgTAP RLS coverage; local Supabase suite 32 checks проходит.
- Добавлены en/tr copy-модуль Receive Flow, component-тесты локализации/draft/error state и mobile Playwright smoke приёмки.
- Receipt suite расширен до 17 тестов: multi-line matrix и native-currency payload, membership/empty guards, invalid quantity/cost/currency и form submission.
- На `zebra-retail-staging` подтверждена receipt business-date migration: EUR/USD boundary fixture дал 2 receipt lines, 2 movements, 2 audit records, корректный Istanbul FX snapshot и idempotent replay; production не изменялся.
- Product Card получила полный en/tr copy, localized upload errors/aria labels и keyboard viewer (`←/→`, `+/-`, `Esc`); component suite расширен до 40 tests.
- На staging подтверждены product-images bucket/RPC/RLS, 9 связанных Storage/DB records, carousel после reload и cross-store denial; fresh file upload smoke остаётся pending из-за настройки Chrome extension.
- Product photo tests покрывают JPEG/PNG/WebP, лимит 8 MiB, cleanup при partial failure, multi-file callback, carousel, close isolation и reset zoom/pan; полный suite проходит 47/47.
- Live receipt RPC payload и localized access/FX/validation/duplicate error mapping вынесены в `features/receipts` и покрыты unit tests.
- Добавлена чистая demo receipt calculation в `features/receipts`: валидация quantities, merge существующего variant, детерминированное создание нового и receipt activity result.
- Добавлен Playwright e2e сценарий demo sale одного variant двумя строками в EUR и USD: проверяются две позиции, success toast и точное списание остатка; desktop/mobile suite проходит.
- Добавлен Playwright foundation без secrets: demo server на localhost, Chromium desktop/mobile viewport и smoke dashboard suite (2/2 PASS).
- Добавлен pgTAP integration suite atomic sales RPC: mixed EUR/USD payments, FX snapshots, repeated variant lines, rollback insufficient-stock/missing-FX/payment-mismatch, movements и audit; 25 checks проходят после чистого reset.
- Добавлен воспроизводимый локальный Supabase/pgTAP harness: pinned CLI-команды, чистый reset migrations и baseline schema/RPC checks; два последовательных прогона прошли успешно (7/7).
- Sale Flow получил два режима: `Per-item price` и `Total sale price`.
- В общей цене несколько товаров оформляются одной single/mixed оплатой без фактических цен отдельных строк.
- Подготовлена атомарная migration/RPC с sale-level EUR revenue, native payment snapshots, stock movements и audit.
- Migration общей цены применена к `zebra-retail-staging`; production не изменялся.
- Добавлены regression tests для single total price и multi-item 50 EUR + 50 USD; всего проходят 17 tests.
- Завершён авторизованный smoke-test `sale_total` на `zebra-retail-staging`: три товара с оплатой 50 EUR + 50 USD, payment/FX snapshots, inventory movements, audit и rollback при недостаточном остатке подтверждены; production не затрагивался.
- Подтверждена staging sale одного variant двумя разными строками 100 EUR и 100 USD: native payment/FX snapshots, stock movements, audit и rollback при недостаточном остатке работают атомарно.

### Changed

- Receive Flow перенесён в `features/receipts/ui`; legacy component path удалён без изменения поведения формы.
- Product Card перенесена в `features/catalog/ui`; carousel, fullscreen zoom/pan, upload и sell callbacks сохранены.
- Mixed payment теперь относится ко всей корзине и больше не ограничен одним товаром.
- Live/demo reporting сохраняет общий revenue; распределение по товарам используется только как явно помеченная аналитическая allocation.
- Price Type стал первым обязательным шагом New Sale; product fields скрыты до выбора режима.
- В Per-item price чекбокс Mixed payment перенесён перед Actual sale price; в Total sale price сохранён перед общей суммой.

### Fixed

- New Sale в live mode заново загружает дневные Owner FX rates перед открытием: сохранённые TRY/USD rates сразу доступны в Mixed Payment; добавлены regression tests загрузчика курсов.
- Для одной позиции в `Per-item price` Mixed Payment автоматически конвертирует все payment lines в EUR и подставляет цену sale line; ручное поле цены скрыто.
- В Light theme placeholder полей теперь светлее, а введённые значения тёмные и читаемые.
- Receive Flow сохраняет выбранное количество в итоговой кнопке, явно отличает серые примеры от введённых данных и объясняет незаполненные обязательные поля вместо молча заблокированного действия.
- Inventory сортирует товары в наличии перед вариантами с нулевым остатком до пагинации; добавлены regression tests, полный suite проходит 49/49.
- Demo receipt теперь атомарно отклоняет неположительную/нечисловую стоимость и неподдерживаемую валюту до изменения локального склада.
- В Per-item price строки Mixed payment теперь открываются сразу после галочки, до ввода цены; до появления общей суммы показывается корректная подсказка вместо ложной ошибки баланса.
- Добавлен regression test этого сценария; всего проходят 19 tests.

## 2026-08-09

### Architecture

- Введён task-based workflow с минимальным контекстом: `PROJECT_STATUS.md`, компактная `ARCHITECTURE.md` и 100 последовательных `docs/tasks/TASK-NNN.md`; TASK-001 оставлен в статусе `pending`.
- Начато постепенное разделение frontend на feature-модули: добавлены `features/workspace` и `features/catalog`.
- Введён `NEXT_PUBLIC_APP_MODE=demo|live`; middleware, Auth и workspace data используют одну границу режима.
- Live workspace загружает catalog, sales, sellers и activity из Supabase, а mock-данные доступны только demo source.
- При ошибке live-загрузки показывается retry-state без подстановки вымышленной выручки, продавцов или операций.
- Стабильный UUID варианта теперь используется как client product id в live-каталоге.
- Добавлен `features/sales`: live query/mutation, локализованные domain errors, demo calculation и Sale Flow отделены от dashboard composition.

### Fixed

- Подготовлена migration `20260809153000_sale_line_identity.sql`: один variant может иметь отдельные sale lines с разными actual price/currency, а одинаковые variant + price + currency остаются уникальными; staging application вынесено в TASK-002.
- Seller Goal получил отдельный пункт навигации для роли Seller и перенесён в `features/seller-goals`.
- FX form больше не просит вводить непривычный обратный курс: Owner вводит `1 EUR = X currency`, видит preview, а database `eur_rate` вычисляется автоматически.
- Mixed-currency Activity Feed показывает original totals и отмечает EUR total как конвертированное значение вместо неясной единственной суммы.
- Исправлен FX lookup при приёмке после полуночи: новая staging migration использует business date `Europe/Istanbul`, а не UTC-date timestamp.
- Receive Flow больше не показывает ошибку про обменный курс для любой неудачной приёмки; сообщения различают курс, доступ и некорректные данные.
- Клиент больше не отправляет UTC timestamp как источник business date при сохранении приёмки.
- Фотокарусель теперь получает подписанную ссылку на каждую сохранённую фотографию, а не только часть batch-результата.
- Полноэкранный viewer больше не закрывается при zoom или переходе между фотографиями; карточка также синхронизирует все доступные файлы из Storage-папки модели.
- В viewer добавлен drag/pan для увеличенной фотографии на desktop и touch-устройствах.
- Product Card получила контекстный переход в New Sale с предзаполненным model code.
- Верхняя ценовая карточка товара теперь показывает `Sell price` = 3× закупочной цены в исходной валюте.
- Исправлено отображение supplier у товаров, загруженных из Supabase.
- Подготовлена atomic sales migration: sales/lines/payments, stock guard, price/cost/FX snapshots, inventory movement и audit log.
- New Sale подключён к live `confirm_sale` RPC; успешная операция обновляет реальные остатки, а ошибки недостатка товара и FX выводятся в форме.
- Demo sale теперь проверяет всю корзину до изменения state и не допускает частичного списания при устаревшем остатке.
- Sale Flow полностью локализован на English/Turkish, включая empty/error states и элементы корзины.
- Исправлено неявное добавление выбранной, но не добавленной через picker позиции при подтверждении продажи.
- Известные ошибки продажи теперь показывают безопасные локализованные действия вместо общего database fallback.
- На `zebra-retail-staging` применены migrations для повторных строк variant с разными price/currency и native-currency payments; ручная проверка sale/rollback остаётся в TASK-002.
- Sale Flow больше не показывает редактор split payments для каждой продажи: обычная sale использует один выбранный способ оплаты, а несколько payment lines доступны только после `Mixed payment`.
- Заполненная следующая позиция теперь сразу включается в Current sale и `Sell N items`; повторный клик `Add another item` для её учёта больше не нужен.
- Sale Flow больше не считает повторно выбранный size сверх остатка: при резервировании последней единицы показывается понятное предупреждение, а в sale отправляется только доступная строка.
- Mixed payment теперь выбирается до ввода цены: для single-item sale обычные поля скрываются, две payment lines показываются сразу, а итоговая EUR-цена рассчитывается автоматически; в multi-item mode этот shortcut недоступен.

### Added

- Добавлена migration `20260809010000_receipt_business_date.sql` и инструкция по безопасному применению в staging.
- Live catalog читает из Supabase модели, варианты, последние закупочные цены и журнал движений; после успешной приёмки таблица остатков обновляется без mock state.
- Добавлена pagination каталога: 10 SKU на страницу, переходы вперёд/назад и автоматический сброс при поиске.
- Подготовлены private `product-images` Storage bucket, store-scoped policies, `add_product_image` RPC и Product Card upload flow для JPEG/PNG/WebP до 8 MB.
- Нажатие на изображение в Product Card открывает полноэкранный viewer со сменой фото и zoom 100–300%.
- Подготовлена migration `20260809160000_native_currency_payments.sql`: каждая payment line хранит исходную сумму/валюту, FX snapshot и EUR значение.
- Sale Flow поддерживает Cash/Card/Bank transfer в EUR/USD/TRY/RUB/GBP, разбивку оплаты и EUR preview.
- Добавлены Vitest + React Testing Library, 10 unit/component tests для payment calculations, live RPC payload, demo sale и Sale Flow.

## 2026-08-08

### Added

- Создано одностраничное Next.js + Tailwind demo Zebra Retail.
- Добавлены роли владельца и продавца, три магазина, mock-склад, продажи и приёмка из текста.
- Добавлены mock-управление продавцами, периоды отчётов, поиск и адаптивная навигация.
- Проведён read-only аудит существующего Zebra Telegram Bot и SQLite-модели на VPS.
- Созданы `AGENTS.md` и комплект постоянной проектной документации для handoff между чатами, моделями и агентами.
- Реализован новый Sale Flow: model code → доступный color → доступный size → actual price/currency → multi-item cart.
- Текстовая mock-приёмка заменена ручной формой с автоподстановкой существующей модели и быстрыми suggestions.
- Добавлен Owner low-stock carousel с автоматической сменой конкретного товара каждые 4,2 секунды.
- Mock-каталог дополнен вариантами одной модели с общим barcode/code.

### Changed

- Seller dashboard больше не показывает selector магазина и low-stock KPI.
- Активный demo-интерфейс сужен до clothing pilot Zebra Boutique.
- Все четыре mock Seller назначены в clothing store; форма добавления Seller теперь требует email и phone.
- Магазин переименован из Zebra Woman в Zebra Boutique.
- Приёмка перестроена в матрицу color → sizes → quantity; неоднозначная кнопка `Add another variant` удалена.
- Добавлены Light/Dark themes с сохранением выбора в браузере.
- Seller может задавать личные day/week/month/year goals в EUR.
- Строки склада открывают карточку модели с фотокаруселью, цветами, размерами и остатками.
- Сгенерировано 15 mock-фотографий для пяти clothing-моделей.
- Добавлены Supabase SDK, browser/server client helpers и `.env.example` без секретов.
- Добавлена первая Supabase migration: profiles, stores, memberships, каталог, suppliers, receipts, inventory movements, FX rates и RLS foundation.
- Добавлены Magic Link login, PKCE callback и middleware серверной проверки сессии; автоматическая регистрация неизвестных email выключена.
- Добавлен server-side active-membership guard, `/api/session` и access-denied state; при подключённом Supabase demo role switcher скрывается.
- Добавлена en/tr i18n foundation: language switcher на desktop/mobile, local persistence и синхронизация `profiles.locale`; локализованы ключевые dashboard, navigation и inventory labels.
- Удалены оставшиеся русские строки из production UI и mock data; gender/category domain values нормализованы в English keys.
- Подготовлена следующая Supabase migration с Owner-only audit log и idempotent `confirm_inventory_receipt` RPC для атомарной ручной приёмки.
- Подготовлена Owner-only `upsert_exchange_rate` RPC migration для ручных дневных EUR conversion rates с audit trail.
- Добавлен Owner FX settings UI; live Receive Flow вызывает staged `confirm_inventory_receipt`, а не изменяет mock-остатки.
- В стандартную size grid приёмки добавлен `2XL`; расширенные размеры остаются в `Other size`.
- Исправлен контраст выбранных chips в Light theme.
- Исправлена ошибка `LowStockCarousel` при изменении количества low-stock товаров.

### Verified

- Production build Next.js проходит.
- Local server возвращает HTTP 200.

### Known limitations

- Staging database существует, но каталог, приёмка и продажи в UI ещё mock и сбрасываются после перезагрузки.
- Magic Link ожидает `.env.local`, настройки redirect URL и ручную проверку с реальным email.
- После добавления membership guard Magic Link нужно повторно проверить локально; dev server в момент HTTP smoke-check не был запущен.
- Sale Flow, Receive Flow, Product Card, login и часть dialog states пока показывают English в Turkish locale; полный Turkish pass остаётся в backlog.
- Receipt migration ещё не применена и не проверена интеграционно на staging; UI пока использует mock receipt flow.
- Exchange-rate migration applied to staging; live UI still needs an authenticated manual test after the email rate limit resets.
- Real catalog/stock query ещё не подключён, поэтому staging receipt появится в базе, но не в mock inventory table до следующего этапа.
- Visual regression, i18n English/Turkish, tests и Supabase integration ещё не завершены.
- Write RPCs, server-side RBAC, audit log и live data connection ещё не реализованы.

### Product decisions

- Утверждена модель общей цены multi-item sale: платежи относятся ко всей продаже, а выручка не распределяется по товарам искусственно; реализация разбита на TASK-106–TASK-111.
- Основной канал утверждён как web/PWA.
- Приложение разрабатывается первым; Telegram-бот адаптируется позже.
- Выбран Supabase Auth Magic Link.
- Базовая валюта утверждена как EUR.
- Утверждён чистый старт без миграции старого каталога и продаж.
- Продавцу разрешены закупка, маржа и продажи только своего магазина.
- Добавлена предварительная рекомендация Vercel + managed Supabase.
- Первый production MVP сужен до магазина одежды; обувь и сумки перенесены на следующие этапы.
- Зафиксированы English/Turkish, EUR base currency, transaction currencies EUR/USD/TRY/RUB/GBP и Cash/Card/Bank transfer.
- Зафиксирована business week Wednesday–Tuesday с будущей owner-настройкой.
- Описана clothing-модель: общий model code, отдельные size/color variants и поддержка существующих barcodes.
- Добавлен отдельный `docs/MVP_SCOPE.md` с exit criteria clothing pilot.
- Hosting Vercel + managed Supabase подтверждён.
- Утверждены multi-item sale, mixed payments и свободная фактическая цена без discount entity.
- Уточнён UX оплаты: обычная sale использует одну явно выбранную Cash/Card/Bank transfer payment line; несколько payment lines открываются только чекбоксом `Mixed payment`.
- Денежный возврат исключён из Clothing MVP; остаётся обмен.
- FX rates вводятся Owner вручную один раз в день.
- Barcode вводится вручную; AI extraction фотографии этикетки отложен.
- Подтверждены только роли Owner/Seller и pilot из пяти пользователей на iPhone/Android.
- Утверждены правила exchange: доплата при более дорогом товаре, без возврата разницы при более дешёвом.
- Seller получил право на exchange и cancellation ошибочной sale с обязательным audit для Owner.
- Customer receipt исключён из Clothing MVP.
- Purchase cost поддерживает EUR/USD/TRY/RUB/GBP.
- Owner приглашает Seller по email + phone через Supabase Magic Link.
- Product Discovery завершён; проект переведён на Frontend Foundation и visual review.
- Добавлен `docs/UI_REVIEW.md`.
# 2026-08-12

- Added an authenticated pgTAP RLS regression suite for Owner, Seller, cross-store and anonymous boundaries.
- Added shared accessible form primitives, Owner-only `SellerManager`, pure overview/inventory selectors, dashboard shell foundation and versioned demo persistence adapter.
- Consolidated dashboard design tokens and responsive rules; Playwright now validates production-like desktop, tablet, mobile and light-theme smoke flows.
- Extracted dashboard navigation, header and shell composition into reusable layout components.
- Extracted KPI, chart, Seller ranking and goal composition into the read-only Overview feature.
- Extracted inventory search, pagination and Product Card selection into InventoryList.
- Extracted compact/full Activity Feed with unified original-currency formatting.
- Added stable dashboard section URLs with deep-link and mobile-navigation coverage.
- Persisted demo workspace mutations across reloads and added a reset-to-baseline control.
- Added transport-independent session and workspace contracts at the API boundary.
- Added catalog, receipt and inventory contracts with explicit receipt idempotency mapping.
- Added sales and payment contracts for repeated priced variants and native-currency payments.
- Localized dashboard low-stock states and made KPI formatting locale-aware.
- Added install-safe Zebra Retail PWA manifest, standalone metadata and maskable icons.
- Paused the task sequence for owner mobile verification of the PWA install flow before continuing non-PWA work.
- Added TASK-131–TASK-136 as a gated PWA hardening, HTTPS preview and physical-device verification track before accessibility work resumes.
- Added reproducible Android/iOS PNG install assets with manifest, dimension, MIME and browser coverage.
- Restored Overview KPI, chart and seller-ranking presentation after locale formatting changes.
- Localized the PWA preview-critical Audit Log, Seller Goal, modal close/access-loading and navigation labels; added Turkish component and browser smoke coverage.
- Published an isolated Vercel HTTPS demo preview for physical PWA installation testing; it is pinned to demo mode with no Supabase or VPS connection.
- Replaced the PWA Android/iOS icon set with the approved black-and-white zebra-striped `Z`; regenerated PNG and maskable assets.
- Closed the PWA mobile gate after the Owner re-verified Android/iOS installation, the new icon, standalone launch and core demo flows on the Vercel HTTPS preview.
- Completed the accessibility pass: dialogs and mobile navigation now manage keyboard focus correctly, status messages are announced, Light/Dark contrast tokens were strengthened, and axe/keyboard/reduced-motion browser coverage was added.
- Completed desktop/tablet/iPhone/Android viewport QA with no new visual or interaction findings; local production browser console stayed clean and previous Owner physical-device evidence remains valid.
- Added a store-scoped Sales History view with paginated localized details, seller/status/product information and original-currency payment snapshots without recalculating historical FX.
- Added an atomic, auditable sale cancellation RPC: Seller store access and mandatory reason are enforced server-side, stock is restored through reversal movements, payment snapshots become reversed, and duplicate requests are idempotent.
- Recorded TASK-198 from Owner renewed local visual intake: after saving a product,
  Owner must be able to find and remove a mistakenly uploaded photo. TASK-178's
  private live deletion safeguards remain required; the local demo must make the
  scenario verifiable too.
- Completed TASK-192: Turkish seller greeting now ends after the name, while the
  Zebra Boutique supporting line retains `bol satışlar!`; demo production build
  passed.
- Completed TASK-193: light-theme secondary actions now have explicit readable
  enabled, disabled and hover states across reports, Sale Flow and Owner catalog
  actions; targeted tests (17/17) and demo build passed.
- Completed TASK-194: selected Audit Log category chips now retain a readable,
  visually strongest violet treatment in light theme; 6 targeted tests and demo
  build passed.
- Completed TASK-195: duplicate/out-of-stock warning preserves its status and
  reservation semantics while becoming readable in light theme; 11 targeted tests
  and demo build passed.
- Completed TASK-196: photographed demo sale lines now retain their sale-time
  photo reference, so Sale Details visibly renders its thumbnail/fullscreen flow;
  12 targeted tests and demo build passed.
- Completed TASK-197: Product Details puts Sell first and combines Owner entry to
  product details/code editing without merging their audited server saves; 15
  targeted tests and demo build passed.
- Completed TASK-198: Owner can remove a mistakenly saved product photo in the
  persisted local demo as well as the protected live flow; 18 targeted tests and
  demo build passed.
- Recorded TASK-199—TASK-201 from the physical staging Redmi walkthrough:
  light-theme error/active contrast, live workspace load failure, and Cash
  export/print regressions. TASK-165 made no in-place repair.
- Completed TASK-199: light-theme workspace error/retry and active Audit category
  foreground are now readable on their tinted surfaces; 6 targeted tests and demo
  build passed.
- Owner accepted TASK-200 and TASK-201 on the current staging Preview: app loads
  and links/downloads work. No code, configuration or production changes were
  made; TASK-165 physical acceptance resumed.
- Completed TASK-165: Owner confirmed the resumed shared staging/device checklist
  works without new P0/P1 findings. This is staging acceptance only; production
  remains untouched pending TASK-084/TASK-149.
- Recorded the first post-pilot feature in `docs/POST_PILOT_FEATURES.md`: add
  products from a Turkish invoice through `Receive product`, mobile camera or
  file upload, human-reviewed OCR draft, atomic save and an Owner invoice archive;
  aligned the existing TASK-089—TASK-093/TASK-119—TASK-122 backlog without
  starting implementation or changing the TASK-088 pilot pointer.
- Recorded the second post-pilot feature and aligned TASK-124—TASK-130: after the
  customer leaves, Seller can capture a rapid sequence of product labels, review
  and correct one consolidated cart form, enter actual price/payment and only
  then atomically save the sale; implementation and TASK-088 scope are unchanged.
- Recorded the Owner decision for label-assisted sales: the authoritative sale
  timestamp is the server-confirmed final save time; Seller does not enter a
  separate checkout/service time.
- Added pending TASK-206 and the third post-pilot feature: automatically fetch
  daily FX rates server-side from an approved official source, retain source/stale
  metadata, safe weekend carry-forward and audited Owner manual fallback, without
  recalculating historical financial snapshots or changing TASK-088.
- Expanded the pending TASK-204 sales brief with the Owner's 11 landing-page
  advantages, 9 additional evidence-backed product benefits, safer marketing
  wording and an explicit separation between current capabilities and post-pilot
  AI/automation/multi-store roadmap claims; no landing implementation started.
- Updated the future TASK-204 positioning per Owner direction: AI-assisted invoice
  receiving is a primary commercial benefit, with public publication gated on
  completion and acceptance evidence for TASK-089—TASK-093/TASK-119—TASK-122.
- Started the Owner-authorized TASK-204 and added an isolated `/landing` sales
  surface: Turkish-first/English bilingual premium responsive design, synthetic
  desktop/mobile product proof, implemented-feature narrative, Owner/Seller
  value, trust/recovery sections, demo CTA and corrected bespoke Open Graph card.
  Demo production build passed; public publication waits for explicit Owner
  visual/content and access approval. TASK-088 pilot handoff remains paused.
- Completed TASK-204 after explicit Owner publication approval: the isolated
  Zebra Retail landing passed demo and Sites/vinext production builds, was saved
  from exact commit `399119dcb1779e5369b82dabdea6b1f354e3c507`, deployed publicly
  at `https://zebra-retail-showcase.coolox98614.chatgpt.site` and returned
  `200 OK`. Production application, Auth and business data were not changed;
  the current pointer returned to the preserved TASK-088 pilot handoff.
- Reopened and completed TASK-204 for the Owner-requested v2 visual redesign:
  the landing is now a photo-first fashion-tech campaign with oversized Zebra
  wordmark/headlines, short proof claims, three original editorial scenes,
  scroll-triggered reveal motion, reduced-motion fallback and lazy-loaded
  below-the-fold media. Demo and Sites/vinext builds passed; public version 2
  replaced the prior design at the same URL and returned `HTTP 200`.
- Reopened TASK-204 as `pending` after Owner declined v1/v2 as the final visual
  result. Added a self-contained new-agent handoff with exact feedback, current
  files/assets, rejected implementation history, immutable claim/security
  constraints, existing Sites project/public URL, safe replacement workflow and
  redesign Definition of Done. TASK-088 is paused with its pilot evidence intact;
  the sole continuation command is now `Выполни TASK-204`.
- Implemented and published TASK-204 v3 from the Owner-provided
  `vexon-prompt.md`: Turkish-only sales copy, procedural black/violet particle
  halo, particle preloader, per-character and scroll reveals, custom cursor,
  visual proof cards, synthetic live product panel, concise trust/CTA blocks and
  a matching generated social card. Demo and Sites builds passed, public version
  3 returned `HTTP 200`; TASK remains in progress for Owner visual acceptance.
- Updated TASK-204 copy from Owner-provided `zebra123.md` while preserving the
  accepted v3 visual/motion system. Added concise personnel-vs-system, reporting,
  Magic Link/cross-device, modular retail and stronger final CTA sections with
  code-native proof visuals. Unfinished AI receipt, direct comparison and
  shoes/bags claims are visibly marked `YAKINDA`; current sale/Owner flows are
  `CANLI`. Demo/Sites builds passed and public version 4 returned `HTTP 200`.
