# TASK-035 — Добавить Owner RPC приглашения Seller

Статус: COMPLETED

## Цель

Создавать приглашение по email + phone, profile и active store membership через безопасный серверный boundary.

## Предполагаемые файлы

- `supabase/migrations/<new>_seller_invitations.sql`
- `app/api/sellers/invite/route.ts`
- `features/sellers/model/types.ts`

## Зависимости

TASK-012.

## Критерии готовности

- Только Owner store может пригласить Seller.
- Неизвестный email получает Magic Link без client-side admin secret.
- Повторное приглашение обрабатывается идемпотентно и аудируется.

## Тесты

- API auth/validation tests.
- RLS/RPC integration tests.
- Staging invited-email smoke-test.

## Реализация

- Добавлена migration `20260812090000_seller_invitations.sql`: Owner-only idempotent activation profile/membership, invitation ledger и audit.
- Добавлен server-only `POST /api/sellers/invite`: подтверждает текущего Owner через session/RLS, отправляет Supabase Auth invite для неизвестного email и финализирует Seller membership через RPC.
- Service-role credential читается только server route из `SUPABASE_SERVICE_ROLE_KEY` и не передаётся в browser bundle.
- Migration применена на `zebra-retail-staging`; добавлена последующая защита `20260812100000_seller_invitation_guard.sql`, которая не позволяет понизить Owner до Seller и возвращает повторное приглашение идемпотентно.
- Staging smoke пройден 2026-08-12: Owner отправил invite для `Taylan Zor` через live UI; форма подтвердила доставку письма. Production не затрагивался.
