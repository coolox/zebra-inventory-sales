# TASK-132 — Восстановить visual parity Overview

Статус: pending

## Цель

Проверить и устранить визуальную регрессию Overview после i18n refactor, сохранив locale-aware formatting.

## Предполагаемые файлы

- `features/overview/ui/overview.tsx`
- `features/overview/ui/overview.test.tsx`
- `docs/UI_REVIEW.md`

## Зависимости

TASK-058.

## Критерии готовности

- KPI cards сохраняют прежние icon containers, spacing, responsive typography и accent states.
- Sales chart сохраняет tooltip, chart grid, bar geometry и empty-value presentation.
- Seller ranking сохраняет position, avatar, count и revenue presentation.
- English/Turkish number and currency formatting остаётся корректным.

## Тесты

- Component regression tests.
- Desktop/mobile visual comparison с состоянием до `946e73b`.
- Production build.

