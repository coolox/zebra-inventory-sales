# TASK-093 — Добавить idempotency tests обработки документов

Статус: pending

## Цель

Гарантировать, что повтор upload/extract/review/confirm одного документа не создаёт дубликаты drafts, receipts или movements.

## Предполагаемые файлы

- `supabase/tests/receipt_documents_test.sql`
- `features/receipt-extraction/**/*.test.ts`

## Зависимости

TASK-089, TASK-091, TASK-092, TASK-122.

## Критерии готовности

- Повтор extraction возвращает тот же или безопасно новый draft без stock effect.
- Один source fingerprint не создаёт несколько активных drafts без явного решения пользователя.
- Повтор confirm не создаёт duplicate movements.
- Concurrent confirm имеет один победивший result.

## Тесты

- SQL idempotency/concurrency suite.
- API retry tests.
- End-to-end repeated submission.
