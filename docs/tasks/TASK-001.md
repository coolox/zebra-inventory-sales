# TASK-001 — Разрешить один variant с разными ценами и валютами в одной sale

Статус: COMPLETED

## Цель

Устранить database constraint, из-за которого одна и та же size/color-позиция не сохраняется двумя строками с разными `unit_price` или `currency`.

## Предполагаемые файлы

- `supabase/migrations/<new>_sale_line_identity.sql`
- `supabase/README.md`

## Зависимости

Нет.

## Критерии готовности

- Новая миграция заменяет `unique (sale_id, variant_id)` на идентичность строки, допускающую разные price/currency.
- Одинаковые variant + price + currency по-прежнему не дублируются.
- Операция остаётся атомарной и не допускает отрицательный остаток.

## Тесты

- SQL integration: один variant, 100 EUR + 100 USD сохраняются одной sale.
- SQL integration: при недостаточном суммарном остатке вся sale откатывается.
- `npm run build`.

## Результат

- Добавлена migration `20260809153000_sale_line_identity.sql`.
- Статическая проверка подтверждает удаление старого constraint и новую уникальность `(sale_id, variant_id, unit_price, currency)`.
- Сохранён существующий последовательный stock check внутри atomic `confirm_sale` transaction.
- `npm run build` выполнен успешно.
- Runtime SQL integration не запускался локально: в проекте ещё нет SQL harness (TASK-012). Применение migration и оба runtime сценария выполняются в TASK-002 на staging.
