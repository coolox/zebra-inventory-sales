# TASK-053 — Добавить local persistence adapter

Статус: COMPLETED

## Цель

Создать versioned browser-storage interface для demo данных без смешивания с live source.

## Предполагаемые файлы

- `features/workspace/data/demo-persistence.ts`
- `features/workspace/model/workspace-data.ts`

## Зависимости

TASK-009.

## Критерии готовности

- Adapter read/write/reset имеет version и safe parse.
- Повреждённые данные сбрасываются к mock baseline.
- Live mode никогда не читает demo storage.

## Тесты

- Unit tests serialize/upgrade/corrupt/reset.
- Mode boundary tests.
- Typecheck.

## Результат

- Добавлен versioned browser persistence adapter с safe parse, corruption cleanup и reset к независимому mock baseline.
- Unit tests, TypeScript и production build проходят. Live source не импортирует этот adapter.
