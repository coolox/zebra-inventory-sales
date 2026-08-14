# TASK-080 — Добавить observability и error monitoring

Статус: COMPLETED

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

## Выполнено

- Добавлен provider-neutral observability boundary: redacted structured server events,
  безопасный клиентский fire-and-forget endpoint, global error boundary и Node.js
  instrumentation для unhandled exceptions/rejections.
- Критичные frontend operation failures `sale.confirm`, `receipt.confirm` и
  `auth.magic_link` получают operation/correlation context без отправки товара,
  сумм платежей, email или provider errors.
- `POST /api/observability` принимает только ограниченный JSON payload, rate-limited
  и доступен до sign-in, чтобы ошибка Magic Link тоже могла быть зарегистрирована.
- Добавлена [OBSERVABILITY.md](../OBSERVABILITY.md): список редактируемых данных,
  включение через non-secret `NEXT_PUBLIC_OBSERVABILITY_ENABLED=true`, текущий
  Vercel Preview log sink и release-blocker policy для sale/receipt/auth ошибок.

## Evidence

- Локально: `npm test` — **80 files / 187 tests**; отдельные synthetic
  client/server/redaction/middleware tests проходят; `npm run lint` — 0 errors,
  24 ранее существовавших warnings; `npm run build:demo`, `npm run build:live` и
  `git diff --check` проходят.
- Staging Preview `https://zebra-inventory-sales-fkn819bfk-cooloxs-projects.vercel.app`
  собран в live mode и Ready. В Vercel Preview (только Preview, не Production)
  включён `NEXT_PUBLIC_OBSERVABILITY_ENABLED=true`.
- Synthetic `sale.confirm` POST вернул `204`; Vercel runtime log содержит
  environment/operation/correlation/path и только `[redacted-email]` / `[redacted]`.
  Исходные синтетические email и Bearer value в лог не попали. Реальные продажи,
  receipts, Magic Link emails и production не затрагивались.

## Следующее ограничение

Текущий sink — Vercel Preview logs: критичные события блокируют staging acceptance
до разбора, но автоматического получателя уведомлений пока нет. До production
Owner должен выбрать provider, retention и recipients согласно `OBSERVABILITY.md`;
это не запускает дополнительную разработку в этой задаче.
