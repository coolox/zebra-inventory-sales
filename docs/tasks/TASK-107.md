# TASK-107 — Поддержать общую цену в confirm sale RPC

Статус: COMPLETED

## Цель

Обновить атомарное подтверждение sale так, чтобы payments относились ко всей multi-item sale и определяли total revenue в режиме `sale_total`.

## Предполагаемые файлы

- `supabase/migrations/<new>_confirm_sale_total_pricing.sql`
- `supabase/README.md`
- `docs/tasks/TASK-107.md`

## Зависимости

TASK-106.

## Критерии готовности

- RPC принимает pricing mode, несколько sale lines и sale-level payment lines.
- В `sale_total` total EUR вычисляется по сохранённым дневным FX snapshots.
- В `per_item` сохраняется текущая проверка суммы lines и payments.
- Stock movements, payments, sale, lines и audit создаются одной транзакцией.
- Ошибка FX, нехватка stock или некорректная сумма полностью откатывает sale.
- Повторный variant и разные валюты остаются поддержаны.

## Тесты

- SQL tests для single/mixed payment и одного/нескольких товаров.
- Negative tests для FX, stock, totals и rollback.

## Результат

- RPC поддерживает `per_item` и `sale_total`, sale-level native payments, stock locks, cost snapshots, movements и audit в одной transaction.
- Runtime SQL validation и rollback smoke-test остаются в TASK-111.
