# TASK-073 — Добавить CSV export reports

Статус: pending

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

