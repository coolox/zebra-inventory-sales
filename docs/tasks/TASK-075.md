# TASK-075 — Добавить PDF export reports

Статус: pending

## Цель

Создать компактный печатный Owner report с period, store, metrics и выбранным breakdown.

## Предполагаемые файлы

- `features/reports/export/pdf.ts`
- `app/api/reports/export/pdf/route.ts`
- `package.json`
- `package-lock.json`

## Зависимости

TASK-072.

## Критерии готовности

- PDF показывает источник периода/store и generated timestamp.
- Таблицы не обрезаются на целевом page size.
- Нет customer receipt semantics.

## Тесты

- Render PDF pages to images.
- Visual QA long/empty reports.
- API authorization test.

