# TASK-084 — Настроить production Auth SMTP и redirects

Статус: WAITING

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
