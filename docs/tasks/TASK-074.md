# TASK-074 — Добавить XLSX export reports

Статус: pending

## Цель

Создать spreadsheet export Owner reports с типизированными money/date cells.

## Предполагаемые файлы

- `features/reports/export/xlsx.ts`
- `app/api/reports/export/xlsx/route.ts`
- `package.json`
- `package-lock.json`

## Зависимости

TASK-072.

## Критерии готовности

- Workbook содержит summary и requested breakdown.
- Money/date types не экспортируются как ambiguous strings.
- Permission/filter contract совпадает с UI.

## Тесты

- Workbook structural inspection.
- API authorization/filter tests.
- Open in Excel/LibreOffice smoke-test.

