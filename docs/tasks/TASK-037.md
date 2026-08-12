# TASK-037 — Добавить deactivate/reactivate Seller backend

Статус: COMPLETED

## Цель

Позволить Owner блокировать и возвращать доступ Seller без удаления profile/history.

## Предполагаемые файлы

- `supabase/migrations/<new>_seller_membership_status.sql`
- `app/api/sellers/status/route.ts`

## Зависимости

TASK-035.

## Критерии готовности

- Только Owner меняет status membership своего store.
- Deactivated Seller немедленно теряет workspace access.
- Изменение записывается в audit log.

## Тесты

- API/RLS tests Owner, Seller, cross-store.
- Session guard test after deactivation.
- Idempotent same-status test.

## Результат

- Добавлена migration `20260812110000_seller_membership_status.sql` с Owner-only RPC `set_seller_membership_status`.
- RPC блокирует только Seller membership выбранного store, не меняет profile и не удаляет историю; `active`/`blocked` — единственные разрешённые состояния.
- Одинаковый повторный status не создаёт второй audit event; изменение пишет `seller.deactivated` или `seller.reactivated` с предыдущим и новым состоянием.
- Добавлен server route `POST /api/sellers/status`; он повторно проверяет active Owner session перед вызовом RPC.
- Добавлен pgTAP сценарий Owner/Seller/cross-store, доступа после блокировки, audit и idempotency. Migration применена на `zebra-retail-staging` 2026-08-12; production не изменялся. Визуальный UI smoke выполняется в TASK-038.
