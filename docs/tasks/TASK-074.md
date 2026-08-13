# TASK-074 — Добавить XLSX export reports

Статус: COMPLETED

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

## Выполнено

- Добавлен Owner-only endpoint `/api/reports/export/xlsx` с тем же store/date/dimension contract, что у Reports UI.
- Workbook содержит листы `Summary` и `Breakdown`; period/generated values сохраняются как Excel dates, financial metrics и breakdown money cells — как numeric EUR cells.
- Добавлена `Export XLSX` action для Owner live Reports; Seller не получает Reports UI и endpoint возвращает `403`.
- Текстовые identifiers нейтрализуют spreadsheet formula prefixes.

## Проверка

- XLSX package проходит structural inspection: проверены workbook/sheet XML, typed dates, numeric EUR values/formats, autofilter и защита formula-prefix text.
- API authorization/filter tests подтверждают `401`/`403` до выполнения report RPC и успешный workbook для active Owner.
- `npm test -- --run` — 156/156; `npm run build` — успешно.
- LibreOffice не установлен в текущем окружении; визуальный smoke доступен через скачивание из Owner live Reports.
