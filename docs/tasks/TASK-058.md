# TASK-058 — Завершить полный Turkish i18n pass

Статус: completed

## Цель

Убрать оставшиеся hardcoded English строки из dashboard, sellers, activity, empty/error states и dialogs.

## Предполагаемые файлы

- `lib/i18n.ts`
- `features/**/ui/*.tsx`
- `components/layout/*.tsx`

## Зависимости

TASK-019, TASK-024, TASK-039, TASK-047, TASK-051.

## Критерии готовности

- В production UI нет нелокализованных visible strings.
- Domain keys не переводятся в persistence/API.
- Date/number/currency formatting учитывает locale.

## Тесты

- Source scan UI literals.
- Component locale smoke suite.
- Desktop/mobile Turkish browser pass.

## Результат

- Dashboard overview и low-stock states используют общий English/Turkish словарь, включая visible text и aria-labels.
- KPI number/currency formatting выбирает `tr-TR` для Turkish и `en-IE` для English.
- Проверены TypeScript, 100 unit/component tests и production build.
