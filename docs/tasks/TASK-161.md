# TASK-161 — Завершить Turkish localization раздела Reports

Статус: COMPLETED

Источник: feedback Owner во время walkthrough TASK-086, 2026-08-17.

Evidence: Owner iPhone screenshot при Turkish locale показывает смешанный интерфейс:
period controls переведены, но `Reports`, description, export actions, KPI labels,
dimensions, table headers, `Unknown seller` и `Low stock` остаются на English.

## Проблема

TASK-144 выполнила targeted pass Supplier/FX/Inventory, но Reports не получил полный
Turkish copy audit. Смешанный язык снижает понятность финансового раздела и нарушает
принятый English/Turkish locale contract.

## Границы

- Перевести весь user-visible Reports copy: title/description, periods, export
  actions, KPI labels, dimensions, table/chart headers, fallback values, low-stock,
  loading/empty/error/retry и accessibility labels.
- Использовать единый существующий glossary (`Revenue`/`Ciro`, Seller, Supplier,
  Brand, Model, Category и другие термины), не создавать разные переводы одного
  понятия на соседних экранах.
- Domain/API keys и exported data identifiers не изменять; переводить только UI.
- Reconciliation placement/copy координировать с TASK-153, compact Low stock layout —
  с TASK-154, чтобы не дублировать business/UI changes.

## Критерии готовности

- При locale `tr` в Reports нет launch-critical hardcoded English, кроме форматов и
  собственных названий, которые по продуктовым правилам не переводятся.
- CSV/XLSX/PDF buttons имеют понятные Turkish action labels без изменения формата
  файлов.
- Dynamic/fallback строки (`Unknown seller`, no data, errors) локализованы.
- Turkish copy помещается на mobile без clipping/horizontal page overflow; широкие
  таблицы сохраняют контролируемый внутренний scroll.
- Переключение EN/TR не сбрасывает period, dimension или загруженные report data.
- Owner-only boundary и reporting calculations не изменяются.

## Проверки

- Targeted copy audit и component assertions для всех Reports states EN/TR.
- Поиск hardcoded user-visible English в Reports feature после реализации.
- iPhone/Android/desktop visual walkthrough.
- Existing reporting/export/authorization regressions и `npm run build`.

## Ограничение

Не начинать исправление, пока Owner не сообщит, что сбор проблем TASK-086 завершён.

## Результат — 2026-08-20

- ReportsDashboard получил полный EN/TR copy для title, description, export actions,
  loading/error/retry, KPI, dimension controls, table headers, empty state и
  accessibility labels.
- Dynamic fallback labels `Unknown seller`, `Unknown` и `Unassigned` отображаются
  на Turkish локализованно. Названия моделей, брендов и идентификаторы export files
  не менялись.
- Money formatting использует `tr-TR` при Turkish locale; Low stock и Reconciliation
  сохраняют свои существующие локализованные реализации.
- Смена EN/TR не меняет period, dimension или уже загруженные report data; расчёты,
  Owner boundary и export URLs остаются прежними.

## Evidence

- Targeted Turkish component audit: dashboard, exports, active dimension, fallback,
  low-stock и reconciliation states PASS.
- Full Vitest: 84 files / 214 tests PASS.
- Demo и live production builds PASS; 0 новых lint errors (23 existing warnings).
