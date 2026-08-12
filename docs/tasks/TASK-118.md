# TASK-118 — Нормализовать цвета и удалить staging test fixtures

Статус: IN PROGRESS

## Цель

Убрать из Receive Flow тестовые значения вроде `Boundary EUR/USD` и объединить дубликаты цветов (`black`, `Black`, `siyah`) через каноническую модель цвета.

## Предполагаемые файлы

- `features/catalog/model/colors.ts`
- `features/receipts/ui/receive-flow.tsx`
- `supabase/migrations/<new>_canonical_colors.sql`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-021.

## Критерии готовности

- Перед удалением выполнен read-only audit точных staging model/variant IDs тестовых fixtures.
- Удаление/архивация тестовых данных выполняется только после явного подтверждения владельца и имеет rollback plan.
- Цвет хранится канонически, а EN/TR labels показываются локально (`black` → `Black`/`Siyah`).
- Case и известные EN/TR synonyms не создают отдельные chips.
- Suggestions для существующего товара ограничены выбранной моделью; для нового товара используются нормализованные значения, а не весь грязный catalog.

## Тесты

- Case/synonym normalization unit tests.
- Existing model scoped suggestions component test.
- Staging audit до/после cleanup и inventory reconciliation.

## Реализация 2026-08-12

- UI получает единый канонический цвет: case и известные EN/TR синонимы объединяются (`black`, `Black`, `siyah` → `Black`). Подписи локализуются (`Black` → `Siyah` в Turkish UI).
- Временные значения, содержащие currency/boundary marker, не показываются в chips; список существующей модели больше не смешивается с другими моделями.
- Добавлены unit/component tests. Физическая нормализация и cleanup staging данных остаются отдельным этапом: он требует успешного read-only audit точных IDs и явного разрешения владельца на изменение данных.
