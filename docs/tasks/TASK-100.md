# TASK-100 — Провести multi-store rollout и reconciliation

Статус: pending

## Цель

Подключить Steps/Bags поэтапно после обучения, initial inventory и проверки transfers.

## Предполагаемые файлы

- `docs/operations/MULTI_STORE_ROLLOUT.md`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-086, TASK-097, TASK-099.

## Критерии готовности

- Каждый store имеет users, catalog, initial stock и backup coverage.
- Network reports сходятся с store-level totals.
- Rollout gates и support owner зафиксированы.

## Тесты

- Per-store physical/system reconciliation.
- Network report sum check.
- Auth/transfer/sale device matrix.

