# TASK-041 — Добавить store-scoped audit log query

Статус: COMPLETED

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

## Выполнено

- Добавлен store-scoped loader с нормализованными категориями событий и безопасным именем actor без email или иных контактных данных profile.
- Contract поддерживает action/category filters и ограниченную, стабильную pagination.
- Owner/Seller/cross-store RLS boundary покрыта pgTAP fixture; mapper покрыт unit test.
