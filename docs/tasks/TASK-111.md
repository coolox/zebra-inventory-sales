# TASK-111 — Применить общую цену sale на staging

Статус: COMPLETED

## Цель

Применить новые sales migrations только к staging и вручную подтвердить реальные данные, audit и rollback.

## Предполагаемые файлы

- `supabase/README.md`
- `docs/tasks/TASK-111.md`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-107, TASK-110.

## Критерии готовности

- Migrations применены только к `zebra-retail-staging` после явной проверки target.
- Подтверждена обычная multi-item sale.
- Подтверждена sale из трёх товаров с 50 EUR + 50 USD.
- Проверены sale, lines, payments, FX snapshots, inventory movements и audit.
- Ошибочный сценарий доказуемо не оставляет частичных записей.
- Зафиксирован rollback result.

## Тесты

- Ручной staging smoke-test по checklist.
- Read-only SQL verification созданных записей.
- Negative transaction rollback test.

## Промежуточный результат

- 2026-08-10 migration `20260810190000_sale_total_pricing.sql` применена только к `zebra-retail-staging` (`btilgtdfzgmicyxlegqf`).
- Remote migration history подтверждает versions `20260809153000`, `20260809160000` и `20260810190000`.
- 2026-08-10 авторизованный UI smoke-test подтвердил обычную `per_item` multi-item sale: 2 строки, 2 priced lines, оплата 200 EUR и итог 200 EUR.
- Подтверждена `sale_total` из трёх товаров с оплатой 50 EUR cash + 50 USD card: sale `2803fe82-0262-42d3-bacb-c2ad9cfa13d8`, итог 91.67 EUR, три price-less lines, две payment/FX snapshots, три inventory movements и audit `sale.confirmed` с `pricing_mode=sale_total`.
- Negative rollback test отправил валидную строку и строку с превышением остатка; RPC вернул `Insufficient stock`, тестовая sale не создана, а остатки проверочных вариантов остались 2 и 1. Результат: `rollback_verified`.
