# TASK-094 — Выделить общий application API для web и Telegram

Статус: pending

## Цель

Создать transport-neutral service boundary для catalog lookup, receipt drafts и sales commands.

## Предполагаемые файлы

- `lib/application/**`
- `lib/contracts/**`
- `docs/ARCHITECTURE.md`

## Зависимости

TASK-055, TASK-056, TASK-057, TASK-088.

## Критерии готовности

- Web вызывает services без прямого дублирования domain rules.
- Telegram adapter сможет использовать те же commands/queries.
- Auth actor/store context передаётся явно.

## Тесты

- Service contract tests.
- Web regression suite.
- No duplicate direct mutation source scan.

