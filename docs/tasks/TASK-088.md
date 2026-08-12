# TASK-088 — Запустить clothing pilot и ежедневную сверку

Статус: pending

## Цель

Перевести Zebra Boutique на ежедневные реальные receipt/sale operations с контролируемой поддержкой.

## Предполагаемые файлы

- `docs/operations/PILOT_LOG.md`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-080, TASK-082, TASK-084, TASK-086, TASK-087.

## Критерии готовности

- Пять пользователей работают под личными accounts.
- Ежедневно сверяются sales, payments и stock.
- Critical incidents имеют owner, timeline и rollback path.
- Pilot exit decision зафиксировано.

## Тесты

- Daily reconciliation report.
- Backup freshness check.
- Auth/device/operation smoke matrix.

