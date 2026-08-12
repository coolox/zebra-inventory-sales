# TASK-084 — Настроить production Auth SMTP и redirects

Статус: pending

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

