# TASK-097 — Включить Zebra Steps и Zebra Bags

Статус: pending

## Цель

Добавить два магазина в production configuration, memberships и UI только после успешного clothing pilot.

## Предполагаемые файлы

- `supabase/migrations/<new>_additional_stores.sql`
- `features/stores/**`
- `components/layout/app-nav.tsx`

## Зависимости

TASK-088.

## Критерии готовности

- Owner видит сеть, Seller только assigned stores.
- Clothing behavior не регрессирует.
- Category-specific size/data rules изолированы.

## Тесты

- RLS multi-store matrix.
- Owner/Seller navigation tests.
- Per-store catalog/sale smoke.

