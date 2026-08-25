# TASK-087 — Загрузить начальный clothing inventory

Статус: IN PROGRESS

## Текущий прогресс

- 2026-08-25: Owner предоставил фактический count по моделям, цветам и размерам.
- Начальный stock внесён только через production live **Receive product** workflow:
  18 models, 118 sellable variants, 122 units.
- Выборочная трассировка: variant `8893` / Beige / `2XL` имеет подтверждённое
  ручное receipt movement; повторно введённые M/L/XL Beige корректно агрегированы
  в quantity `2`, а не создали duplicate variant.
- В repository не сохранены invoice scans, supplier payment details или другие
  private source-document details.
- Остаётся Owner physical reconciliation: сравнить 122 units и варианты на
  полке с live catalog, зафиксировать discrepancies (если будут) через auditable
  stock adjustment и подтвердить итог.

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
