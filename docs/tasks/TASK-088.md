# TASK-088 — Запустить clothing pilot и ежедневную сверку

Статус: IN PROGRESS

## Старт pilot

- 2026-08-25: TASK-087 закрыт; live baseline для Zebra Boutique — 18 models,
  118 variants, 122 units, физически сверено Owner без discrepancies.
- Создан non-sensitive daily pilot log. До его первого рабочего дня нельзя
  считать pilot завершённым или создавать test sales против реального stock.
- Для acceptance нужны один Owner и четыре Seller с личными active accounts;
  их identities, emails, Magic Links и credentials в repository не записываются.
- Live role check: Owner and one Seller are active. Three additional personal
  Seller accounts remain required before the five-person pilot matrix can pass.

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
