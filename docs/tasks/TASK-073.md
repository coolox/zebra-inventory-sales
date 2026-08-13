# TASK-073 — Добавить CSV export reports

Статус: COMPLETED

## Цель

Экспортировать выбранный report/filter в UTF-8 CSV с явной EUR и original-currency семантикой.

## Предполагаемые файлы

- `features/reports/export/csv.ts`
- `app/api/reports/export/csv/route.ts`

## Зависимости

TASK-072.

## Критерии готовности

- Export использует те же filters и permission scope.
- Колонки стабильны и документированы.
- Formula injection neutralized.

## Тесты

- Unit CSV escaping/injection tests.
- API authorization test.
- Open exported file smoke-test.

## Результат

- Добавлен Owner-only endpoint `/api/reports/export/csv`, принимающий тот же store/date/dimension filter contract, что и Reports UI.
- Поддержаны `summary`, `breakdown` и `inventory` exports с фиксированными documented snake_case columns; финансовые поля остаются EUR snapshots, original free text не интерпретируется как formula.
- CSV использует UTF-8 BOM, CRLF/RFC 4180 escaping и neutralizes spreadsheet formula prefixes `=`, `+`, `-`, `@`.
- В Owner Reports добавлена Export CSV ссылка для выбранных period и breakdown dimension.

## Проверка

- Unit CSV escaping/injection и API Unauthorized/Seller/Owner authorization tests passed.
- `npx tsc --noEmit`, `npm run build`, `git diff --check` — passed.
- Staging/production не изменялись; Docker не запускался.
