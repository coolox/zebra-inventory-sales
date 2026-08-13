# TASK-077 — Добавить concurrent inventory integration tests

Статус: COMPLETED

## Цель

Проверить, что параллельные receipt, sale, cancellation, exchange и adjustment не создают отрицательный или потерянный stock.

## Предполагаемые файлы

- `supabase/tests/concurrency/**`
- `package.json`

## Зависимости

TASK-031, TASK-063, TASK-065.

## Критерии готовности

- Тесты запускают реальные конкурентные transactions.
- Финальный balance совпадает с суммой movements.
- Одна конфликтующая операция корректно отклоняется.

## Тесты

- Concurrent sale vs sale.
- Sale vs adjustment/exchange.
- Repeated runs on clean local database.

## Выполнено

- Добавлен local-only harness с параллельными независимыми `psql` transactions.
- Проверены sale vs sale, sale vs adjustment и sale vs exchange: ровно одна конфликтующая операция отклоняется, а balance равен ledger sum и не становится отрицательным.
- Harness требует чистую local database; повторный clean-run и полный pgTAP suite пройдены.
