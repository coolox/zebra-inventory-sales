# TASK-130 — Проверить безопасность и качество AI label sale

Статус: pending

## Цель

Покрыть camera/upload/extract/match/review/sell workflow privacy, retry, idempotency, accessibility и desktop/mobile browser tests.

## Предполагаемые файлы

- `features/sale-labels/**/*.test.ts*`
- `supabase/tests/sale_label_drafts_test.sql`
- `e2e/sale-labels.spec.ts`
- `docs/AI_PRIVACY.md`

## Зависимости

TASK-124, TASK-125, TASK-126, TASK-127, TASK-128, TASK-129.

## Критерии готовности

- Повтор upload/extract/review не создаёт duplicate cart lines или sales.
- Images недоступны другому store/user и удаляются по retention policy.
- Provider input/output не содержит лишние profile/payment данные.
- Camera/file picker и review доступны с клавиатуры/screen reader и работают на target iPhone/Android devices.
- Low-confidence/unknown/out-of-stock никогда не приводит к silent sale.

## Тесты

- RLS, retention, retry and concurrent submission suite.
- Desktop/mobile E2E: camera fallback, multi-upload, review and final sale rollback.
- Sanitized label fixture quality matrix and false-match review.

