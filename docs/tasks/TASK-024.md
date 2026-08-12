# TASK-024 — Полностью локализовать Product Card

Статус: completed

## Цель

Добавить Turkish для details, price, variants, uploads, viewer и ошибок.

## Предполагаемые файлы

- `features/catalog/ui/product-card.tsx`
- `features/catalog/model/catalog-copy.ts`

## Зависимости

TASK-023.

## Критерии готовности

- Все product-card строки имеют en/tr варианты.
- Locale передаётся явно без чтения global state.
- Viewer aria labels локализованы.

## Тесты

- Component tests en/tr render.
- Keyboard viewer smoke-test.
- Source scan hardcoded UI strings.
