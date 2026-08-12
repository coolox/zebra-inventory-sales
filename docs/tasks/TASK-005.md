# TASK-005 — Исправить RPC mixed payments для исходных валют

Статус: COMPLETED

## Цель

Сохранять каждую payment line с её method, original amount, currency, FX snapshot и EUR amount вместо только `amount_eur`.

## Предполагаемые файлы

- `supabase/migrations/<new>_native_currency_payments.sql`
- `supabase/README.md`

## Зависимости

TASK-001.

## Критерии готовности

- RPC принимает массив native-currency payments.
- Сумма payments сравнивается с sale total в EUR с определённым tolerance.
- FX берётся по business date магазина и сохраняется snapshot.
- Ошибка в payment откатывает sale и stock movements.

## Тесты

- SQL tests для EUR, USD и комбинированной оплаты.
- Mismatch totals откатывает transaction.
- Отсутствующий FX rate даёт точную ошибку.

## Результат

- Подготовлена migration `20260809160000_native_currency_payments.sql`: RPC принимает native-currency payments, сохраняет FX snapshot и сравнивает EUR totals с tolerance 0.01.
- Runtime SQL-проверки будут выполнены вместе со staging smoke-test в TASK-002 (локальный SQL harness появится в TASK-012).
