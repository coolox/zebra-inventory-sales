# TASK-028 — Добавить archive/unarchive product model

Статус: COMPLETED

## Цель

Дать Owner безопасное управление active status без физического удаления каталога и истории.

## Предполагаемые файлы

- `supabase/migrations/<new>_archive_product_model.sql`
- `features/catalog/data/archive-product.ts`
- `features/catalog/ui/product-card.tsx`

## Зависимости

TASK-023.

## Критерии готовности

- Только Owner может архивировать/восстанавливать модель своего store.
- Archived models скрыты из обычной продажи, но остаются в истории.
- Действие попадает в audit log.

## Тесты

- SQL RLS/RPC tests Owner vs Seller.
- Component action/error tests.
- Catalog reload smoke-test.

## Результат

- Добавлена Owner-only RPC `set_product_model_archived`: она меняет только `is_active`, не удаляет модель, варианты, приёмки, движения или продажи и идемпотентна при повторе запроса.
- Каждое фактическое archive/restore действие записывается в `audit_logs`; server-side trigger блокирует продажу inactive model/variant также при stale/direct запросе.
- Обычный каталог, New Sale и Receive Flow исключают архивированные модели. Owner видит отдельный список Archived и может открыть карточку и восстановить модель.
- Покрыты UI confirmation/error/restore tests и pgTAP Owner/Seller/cross-store/audit/sale-guard checks.

## Проверка

- `npm run test` — 57/57 passed.
- `npm run build` — passed.
- Локальные команды `npm run supabase:verify` и `npm run supabase:test` запущены для нового pgTAP набора; окружение не вернуло итоговый вывод CLI, поэтому перед staging apply их нужно повторить в доступном local Supabase/Docker окружении.
- После visual QA исправлен demo handler: mock-каталог не содержит database `modelId`, поэтому archive/restore теперь меняет все варианты общего `Product code`; `npm run build` повторно проходит.
