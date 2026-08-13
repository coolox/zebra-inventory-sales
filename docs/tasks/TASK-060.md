# TASK-060 — Провести accessibility pass

Статус: COMPLETED

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

## Выполнено

- Общий dialog focus-management добавлен для modal, mobile navigation drawer и fullscreen product viewer: initial focus, Tab trap, Escape close и возврат фокуса к trigger.
- Mobile drawer получил корректные `dialog`/`aria-modal` semantics; успешные toast-сообщения объявляются через `role="status"`.
- Добавлен явный global focus ring, усилены secondary text/form placeholder tokens для WCAG contrast в Light/Dark themes и сохранён reduced-motion override.
- Добавлены axe-core component/browser scans и keyboard-only browser smoke. Axe scan Sale/Receive path проходит на desktop, tablet и mobile; Light theme и `prefers-reduced-motion` покрыты browser regression.
