# TASK-023 — Перенести Product Card в features/catalog

Статус: completed

## Цель

Собрать product details, carousel и sell action внутри catalog feature.

## Предполагаемые файлы

- `features/catalog/ui/product-card.tsx`
- `components/product-card.tsx`
- `app/page.tsx`

## Зависимости

Нет.

## Критерии готовности

- Product Card импортируется из catalog feature.
- Upload/sell callbacks и viewer behavior сохранены.
- Legacy component удалён.

## Тесты

- `npx tsc --noEmit`.
- `npm run build`.
- Manual carousel/viewer smoke-test.
