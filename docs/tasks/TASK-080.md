# TASK-080 — Добавить observability и error monitoring

Статус: pending

## Цель

Собирать безопасные frontend/server errors и ключевые operation failures без секретов и лишних персональных данных.

## Предполагаемые файлы

- `lib/observability/**`
- `instrumentation.ts`
- `app/global-error.tsx`
- `.env.example`

## Зависимости

TASK-079.

## Критерии готовности

- Errors имеют environment, request/operation correlation и safe context.
- PII/secrets redaction задокументирована.
- Alert policy определена для критичных sale/receipt/auth failures.

## Тесты

- Synthetic client/server error capture.
- Redaction test.
- Monitoring disabled safely without config.

