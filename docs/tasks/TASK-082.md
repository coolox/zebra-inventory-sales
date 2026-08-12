# TASK-082 — Провести restore rehearsal и rollback plan

Статус: pending

## Цель

Восстановить staging из backup и доказать работоспособность данных/Storage после восстановления.

## Предполагаемые файлы

- `docs/operations/RESTORE.md`
- `docs/operations/ROLLBACK.md`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-081.

## Критерии готовности

- Restore выполнен в изолированное окружение.
- Catalog, stock, sales, payments, audit и images сверены.
- Для migrations и deploy описан проверенный rollback.

## Тесты

- Documented restore drill.
- Row/count/hash reconciliation.
- Application smoke against restored environment.

