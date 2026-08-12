# TASK-041 — Добавить store-scoped audit log query

Статус: pending

## Цель

Получать для Owner нормализованные audit events без прямого раскрытия лишних profile данных.

## Предполагаемые файлы

- `features/audit/data/load-audit-log.ts`
- `features/audit/model/types.ts`

## Зависимости

TASK-012.

## Критерии готовности

- Query доступен только Owner соответствующего store.
- Поддержаны sale, receipt, FX, images, users и inventory actions.
- Pagination и filters имеют стабильный contract.

## Тесты

- RLS integration tests.
- Mapper/pagination unit tests.
- Cross-store denial test.

