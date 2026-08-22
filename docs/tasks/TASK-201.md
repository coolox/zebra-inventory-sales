# TASK-201 — Починить staging Cash export и ограничить Print отчётом

Статус: COMPLETED

Приоритет: P1 — Cash report нельзя получить: export unavailable, Print печатает
весь dashboard.

Источник: Owner staging Redmi walkthrough screenshots, 2026-08-22.

## Наблюдение

В Cash/Kasa report export открывает raw `{"error":"Export unavailable"}`.
Нажатие Print открывает system print с несколькими страницами общего dashboard,
вместо отчёта Cash.

## Границы

- Только authorised Owner Cash report export/print presentation and its live
  export-route availability.
- Не менять ledger totals, currency/payment semantics, RLS, other exports or
  production configuration without explicit authorization.
- Ошибка export должна оставаться понятной UI error, а не raw JSON page.

## Критерии готовности

- Cash print preview содержит только clearly-labelled Cash report, а не полный
  workspace.
- Authorised staging export creates intended CSV/XLSX/PDF output or explains a
  recoverable UI error; raw JSON не открывается пользователю.
- Owner-only boundary and non-physical-cash wording TASK-188 remain intact.
- Targeted tests/build and staging mobile recheck pass.

## Owner acceptance — 2026-08-22

- Owner confirmed that current staging downloads/links work and accepted the Cash
  report path as operational. No code, export-route, ledger, RLS or production
  configuration change was made for this closure.
- If raw JSON export or whole-workspace Print recurs, record it as a new task with
  the exact report action, browser and Preview URL rather than altering TASK-188
  semantics inside a release walkthrough.
