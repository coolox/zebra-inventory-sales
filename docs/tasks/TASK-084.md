# TASK-084 — Настроить production Auth SMTP и redirects

Статус: IN PROGRESS

## Цель

Обеспечить branded и доставляемый Magic Link для production домена.

## Предполагаемые файлы

- `docs/operations/AUTH_EMAIL.md`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-083.

## Критерии готовности

- Custom SMTP configured outside repo.
- Production redirect allowlist минимальна.
- Email template содержит корректный brand/callback и обе supported languages strategy.

## Тесты

- Owner/Seller delivery test.
- Unknown email/non-member denial.
- Expired/reused link test.

## Текущее состояние — 2026-08-16

TASK-084 начата. Owner принял временный managed Vercel HTTPS origin вместо покупки
собственного domain. Он установлен как production Site URL и единственный redirect
allowlist entry; само endpoint value не хранится в repository (D-060). Custom SMTP
сохранён через Owner-controlled Gmail App Password; sender name — `Zebra Retail`.
Magic Link template сохранён как одно branded EN/TR письмо с English-first copy и
двумя ссылками `{{ .ConfirmationURL }}`.

### Acceptance blocker

Configuration is complete, but its delivery acceptance cannot yet be truthfully run:
production has no migrations, controlled Owner/Seller identities or application
deployment. D-044 unknown/non-member denial is server-side schema/application
behaviour, so it cannot be evidenced against an empty project without weakening the
boundary. TASK-085 must bootstrap the controlled test state; TASK-150 supplies the
production callback deployment. The exact matrix is in
[`AUTH_EMAIL.md`](../operations/AUTH_EMAIL.md).

No migration, Git deployment or pilot user was created by TASK-084.

## Production acceptance evidence — 2026-08-24

- The production Site URL remains the stable Vercel origin. The redirect allowlist
  was reduced from two entries to one exact production `/auth/callback` URL; the
  obsolete Vercel origin was removed. There are no wildcard, localhost or staging
  redirects in the production allowlist.
- The hosted Magic Link template was inspected without copying credentials: it has
  the `Zebra Retail` bilingual EN-first/TR-second subject and body, declares
  short-lived single-use behaviour, and uses `{{ .ConfirmationURL }}` for both
  language links.
- Owner Magic Link delivery, callback and persisted workspace session were confirmed
  by the Owner. Seller invitation delivery, callback, persisted Seller session and
  least-privilege workspace were confirmed by the Seller during TASK-150 smoke.
- Remaining matrix evidence is deliberately not inferred: unknown/non-member denial
  and expired/reused-link safe failure require a clean unauthenticated browser
  session plus a human single-use-link action. The active Owner browser session was
  not terminated to manufacture this evidence.
- Owner subsequently completed the clean-session checks: a previously consumed link
  was rejected on reuse, and a valid-looking non-invited email received no link.
  Both outcomes preserve the no-session/no-workspace boundary. The separate
  expired-unused-link check remains pending; its result must not be inferred from
  reuse rejection.
