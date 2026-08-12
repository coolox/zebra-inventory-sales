# TASK-045 — Добавить общие form controls и error presenter

Статус: COMPLETED

## Цель

Унифицировать поля, labels, validation, loading и domain error display без изменения visual language.

## Предполагаемые файлы

- `components/ui/form-field.tsx`
- `components/ui/form-error.tsx`
- `components/ui/action-button.tsx`
- `app/globals.css`

## Зависимости

TASK-009.

## Критерии готовности

- Sale/receipt/invite могут использовать один набор primitives.
- Focus, disabled, invalid и loading states доступны.
- Компоненты поддерживают Light/Dark.

## Тесты

- Component accessibility/state tests.
- Visual smoke Light/Dark.
- `npm run build`.

## Результат

- Добавлены доступные `FormField`, `TextInput`/`TextArea`, `FormError` и `ActionButton`; Invite Seller использует primitives.
- Покрыты invalid/error/loading semantics; TypeScript, 88 Vitest tests и production build проходят.
