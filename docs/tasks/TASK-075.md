# TASK-075 — Добавить PDF export reports

Статус: COMPLETED

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

## Выполнено

- Owner-only `application/pdf` endpoint проверяет активное membership и вызывает server-side reporting RPC.
- Ландшафтный A4 report содержит store, период, UTC timestamp, метрики и выбранный breakdown; длинная таблица переносится на continuation pages.
- В UI Reports добавлена кнопка `Export PDF`; PDF не использует receipt/customer semantics.
- Проверены long и empty fixtures: PDF page count, PNG-render и визуальная читаемость.
