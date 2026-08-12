# TASK-060 — Провести accessibility pass

Статус: pending

## Цель

Исправить keyboard, focus, dialog semantics, labels, contrast и reduced-motion для ключевых flows.

## Предполагаемые файлы

- `components/ui/**`
- `components/layout/**`
- `features/**/ui/*.tsx`
- `app/globals.css`

## Зависимости

TASK-045, TASK-052, TASK-058.

## Критерии готовности

- Sale, receipt, product viewer, navigation и auth работают с keyboard.
- Focus trap/return реализованы для dialogs.
- Contrast и aria names проходят automated checks.

## Тесты

- axe component/e2e scan.
- Keyboard-only smoke-test.
- Reduced-motion and Light/Dark checks.

