# TASK-087 — Загрузить начальный clothing inventory

Статус: pending

## Цель

Создать реальный каталог и начальный stock через утверждённый inventory workflow перед pilot.

## Предполагаемые файлы

- `docs/operations/INITIAL_INVENTORY.md`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-032, TASK-083, TASK-085, TASK-086, TASK-150.

## Критерии готовности

- Каждая model/variant имеет supplier, cost, currency и quantity.
- Начальный balance полностью воспроизводится из movements.
- Owner подписал reconciliation result.

## Тесты

- Physical count vs system reconciliation.
- Random variant trace to source document.
- No negative/duplicate variant audit.
