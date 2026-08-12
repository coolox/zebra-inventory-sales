# TASK-106 — Добавить schema для общей цены sale

Статус: COMPLETED

## Цель

Подготовить обратимо совместимую Postgres migration для хранения режима ценообразования и общей EUR-выручки sale без фиктивных цен отдельных товаров.

## Предполагаемые файлы

- `supabase/migrations/<new>_sale_total_pricing.sql`
- `docs/DATA_MODEL.md`
- `docs/tasks/TASK-106.md`

## Зависимости

TASK-105.

## Критерии готовности

- `sales` различает `per_item` и `sale_total`.
- Подтверждённая sale хранит authoritative total revenue в EUR.
- `sale_total` не требует выдуманной фактической цены для каждой sale line.
- Старые продажи и текущий `per_item` сценарий остаются читаемыми.
- Constraints не допускают противоречивую финансовую запись.
- Migration имеет понятный rollback plan и не применяется к staging в этой TASK.

## Тесты

- Локальная проверка SQL migration и обратной совместимости schema.
- Проверка constraints для обоих pricing modes.

## Результат

- Добавлена обратимо совместимая migration с `pricing_mode`, authoritative `total_amount_eur` и nullable line pricing только для общей цены.
- Старые продажи backfill-ятся как `per_item`.
- Staging application вынесено в TASK-111.
