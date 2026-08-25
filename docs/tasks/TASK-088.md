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
- Pilot observation recorded separately: TASK-203 covers Android Chrome PWA
  installability. Chrome web use remains a safe workaround.
- Pilot observation recorded separately: TASK-205 adds direct mobile camera
  capture to Product Details photo upload; gallery upload remains the workaround.

## Handoff for the next agent

1. Read `docs/PROJECT_STATUS.md`, this task and `docs/operations/PILOT_LOG.md`.
2. Treat every Owner observation during real use as either: a separate defect
   task, a product decision, or a documented safe operating note. Do not mix an
   unreviewed fix into TASK-088.
3. Keep real customer, employee, account, payment and Magic Link data out of the
   repository and task evidence.
4. Do not complete TASK-088 until the five-person matrix, daily reconciliation,
   backup freshness and pilot exit decision have evidence in `PILOT_LOG.md`.

## Owner direction after pilot

After the pilot exit decision, Owner wants a separate marketing presentation and
landing page that clearly explain the product value to prospective store owners.
This is deliberately outside TASK-088: create and scope a new task only after
the current pilot is closed or the Owner explicitly changes priority.

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
