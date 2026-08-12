# TASK-025 — Добавить тесты загрузки и просмотра product photos

Статус: completed

## Цель

Зафиксировать file validation, upload callbacks, carousel, zoom и pan state.

## Предполагаемые файлы

- `features/catalog/ui/product-card.test.tsx`
- `lib/product-images.test.ts`

## Зависимости

TASK-009, TASK-023.

## Критерии готовности

- Покрыты valid/invalid file types и size limit.
- Покрыты carousel navigation и viewer close isolation.
- Покрыт reset zoom/pan при смене фото.

## Тесты

- Targeted catalog photo tests.
- Полный component suite.
