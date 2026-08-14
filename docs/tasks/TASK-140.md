# TASK-140 — Добавить безопасный Seller sales summary API

Статус: pending

## Цель

Дать Seller server-side агрегаты продаж разрешённого магазина и личных продаж без раскрытия строк или результатов других продавцов.

## Границы

- Store summary для Seller: только текущий Istanbul day и текущая Wednesday–Tuesday business week.
- Personal summary: today, week, month, year и all time.
- Каждый summary возвращает EUR revenue и проданные units; cancelled/reversed sales и правила exchange должны совпадать с reporting ledger.
- Seller может получить только aggregate своего active store и только собственные personal totals; individual totals других Seller, cross-store данные и Owner-only Reports не раскрываются.
- Authorisation проверяется в SQL/RPC, не только скрытием UI.

## Зависимости

TASK-068, TASK-069. Задача не зависит от Owner Reports UI.

## Критерии готовности

- Istanbul date/week boundary корректна.
- Store totals today/week и personal totals всех пяти периодов согласуются с ledger.
- Seller не может запросить другой store или другого seller; Owner сохраняет существующие права.

## Тесты

- Local Supabase SQL fixtures: confirmed/cancelled/exchange и Istanbul boundary.
- RLS/RPC regression: Seller own store, cross-store denial, other-seller detail denial.
- Typed adapter tests.
