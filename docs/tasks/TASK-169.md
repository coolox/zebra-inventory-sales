# TASK-169 — Синхронизировать staging Supabase Auth callback с Ready Preview

Статус: COMPLETED

Источник: physical iPhone Magic Link finding in TASK-165, 2026-08-20.

## Цель

Разрешить Magic Link завершать login на текущем Ready staging Preview, указав его
как exact staging Supabase Auth Site URL и exact `/auth/callback` redirect URL.

## Evidence finding

- Owner на physical device запросил Magic Link с Ready Preview
  `https://zebra-inventory-sales-bokm6pf92-cooloxs-projects.vercel.app`, но после
  перехода по email link получил возврат на login вместо workspace.
- Login code передаёт exact current-origin
  `emailRedirectTo: <origin>/auth/callback?locale=…`; callback server-side меняет
  code на session и при успехе открывает `/`.
- Project status сохраняет staging Supabase Site URL/callback на прежний Preview
  `…iey5w0tiw…`, а не на Ready `…bokm6pf92…`. Это безопасная точная причина
  mismatch; никаких email address, token или Magic Link URL не записано.

## Границы

- Изменить только staging Supabase Auth Site URL и exact allowed redirect URL на
  Ready Preview `https://zebra-inventory-sales-bokm6pf92-cooloxs-projects.vercel.app`
  и его `/auth/callback`.
- Не менять Production Auth, production Supabase/Vercel, secrets, SMTP template,
  database или широкие wildcard redirects.
- До write получить явное Owner confirmation именно на это staging Auth изменение.
- После write Owner повторяет один controlled Magic Link Owner/Seller acceptance
  на physical device; не фиксировать email, token или full link в evidence.

## Критерии готовности

- Staging Auth settings в UI подтверждают exact new Site URL/callback и отсутствие
  broad wildcard.
- Owner/Seller controlled Magic Link returns to authenticated workspace on Ready
  Preview; logout remains working.
- TASK-165 device walkthrough resumes; Production remains untouched.

## Staging configuration evidence

- In the `zebra-retail-staging` Supabase Auth URL Configuration UI, Site URL was
  changed from the previous Preview to
  `https://zebra-inventory-sales-bokm6pf92-cooloxs-projects.vercel.app`.
- Exact callback
  `https://zebra-inventory-sales-bokm6pf92-cooloxs-projects.vercel.app/auth/callback`
  was added successfully; UI confirms 7 exact redirect URLs. No wildcard was
  introduced and earlier exact/local rollback entries were not removed.
- No Production project, database, SMTP template, Auth provider, secret value or
  Vercel configuration was changed.

## Awaiting controlled physical acceptance

Owner must now request one new Magic Link from the Ready Preview on a physical
device, open it in the same browser, confirm arrival at the authenticated workspace,
then logout. Report only device class/OS/browser, role and pass/fail; never paste
the email, token or full link. Repeat for the Seller test identity before marking
this TASK complete and resuming TASK-165.

## Additional iPhone observation — 2026-08-21

- During an attempted Home Screen save, Owner reached a third-party Shortcut/tool
  which reports it does not support downloads from this site. Its displayed safe Auth
  summary was `access_denied` / `otp_expired`; no email, token or full URL is
  recorded.
- This does not establish a Supabase callback failure because the link may have
  expired before the third-party tool opened it. The supported controlled acceptance
  remains a fresh Magic Link opened in the same Safari browser.
- The separate supported-install/recovery finding is [TASK-180](TASK-180.md). Do not
  change staging Auth again until controlled same-browser evidence distinguishes the
  two boundaries.

## Deferred after Owner bug intake — 2026-08-21

- Owner completed bug intake and requested the remediation-before-publication plan
  recorded in TASK-190. TASK-170—TASK-189 will produce a new consolidated staging
  Preview URL.
- The existing Auth settings write remains recorded evidence, but physical acceptance
  against the old Preview would not validate the final candidate.
- This task is therefore `BLOCKED` until the consolidated Preview exists. Then update
  only staging Site URL/exact callback to that Preview, run fresh same-browser
  Owner/Seller Magic Link acceptance and continue TASK-180/TASK-165. Production
  remains untouched.

## Consolidated Preview Auth configuration — 2026-08-21

- In `zebra-retail-staging` Auth URL Configuration, Site URL was updated to the
  exact consolidated Preview:
  `https://zebra-inventory-sales-eli6hmy56-cooloxs-projects.vercel.app`.
- Its exact callback
  `https://zebra-inventory-sales-eli6hmy56-cooloxs-projects.vercel.app/auth/callback`
  was added to Redirect URLs. UI confirms 8 exact URLs; no wildcard was added and
  no existing redirect was removed.
- Only staging Auth URL configuration changed. Production, database, providers,
  SMTP templates, Vercel settings and secret values were untouched.
- The controlled same-browser Owner/Seller Magic Link acceptance was recorded
  safely below before this task was marked complete.

## Acceptance evidence

- Owner confirmed that fresh Magic Links for both Owner and Seller arrive and
  open the authenticated workspace on the consolidated Preview. The controlled
  logout path also returns to login. No email address, token or full link was
  retained in documentation.
