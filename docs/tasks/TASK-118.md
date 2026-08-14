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

## Staging read-only audit 2026-08-15

- Выполнен только `SELECT` в `zebra-retail-staging`; `INSERT`/`UPDATE`/`DELETE` не выполнялись.
- Точный test fixture: model `6d3763de-f554-4bcd-92da-6fea5dac74ed`,
  `TASK021-FX-BOUNDARY | TASK-021 FX Boundary Fixture`; variants
  `b3bc1073-7999-4ec5-8f01-667c47b5da44` (`Boundary EUR`, `E23`) и
  `ba4b2695-3396-41da-a515-22b183883dd9` (`Boundary USD`, `U00`).
  Его balance равен `0`, но он имеет 4 inventory movements, 2 receipt lines и
  2 sale lines. Поэтому physical delete недопустим: безопасный вариант —
  обратимо архивировать model, сохранив ledger и историю. Rollback: restore той
  же model через существующий Owner archive/restore flow.
- Дополнительные 13 legacy variants можно физически нормализовать без merge:
  - `AS123` / `91f2747f-7554-480a-b296-b9390c553b02`: `mavi` → `Blue` —
    `cac3d201-6317-4786-92e8-8a3a5791487e` (L),
    `4bf39a96-8b62-4cca-a0c6-d306eca03757` (M),
    `75fa4bb8-2644-46bf-b7b8-9036954b2039` (S).
  - `USD123` / `928c776a-3a3a-46ea-bcf6-e01ba3cc4b29`: `mavi` → `Blue` —
    `30fdf622-d6e5-41be-b26d-5e3fdf340566` (L),
    `61e9c765-5114-434d-9e8c-a43e00dfc367` (M),
    `8f83831b-f8da-45b4-9cff-95f9950c05c8` (S); `siyah` → `Black` —
    `760d3ffe-8f1b-4773-a471-d2c8856529cd` (30),
    `fc8bf5a4-b0fe-4e8f-bc60-8b87da3265f2` (32),
    `5d332f4b-1808-4e44-ad07-5e0c2012faa3` (34),
    `b0a80058-7ae5-450d-94c8-bac6addca949` (36).
  - `XX123` / `81b8c276-6241-4554-9efe-f7db960f1ba9`: `Bej` → `Beige` —
    `a0580a24-67fd-4ba8-86fb-b0c263ac8b53` (L),
    `72098f44-6a71-4d2d-81ee-7a63eb93c4e8` (M),
    `cfd9015a-98a9-46c6-8e8e-beb8adc1240d` (S).

  Audit не нашёл коллизий `(model, size, canonical color)`. Это изменение всё
  ещё требует отдельного явного Owner approval и транзакционной migration с
  обратным SQL.

## Ожидаемое решение Owner

Перед любым изменением staging Owner должен подтвердить один из вариантов:

1. архивировать fixture model и нормализовать 13 перечисленных variants;
2. только архивировать fixture model;
3. не менять staging data.

До такого подтверждения TASK-118 остаётся `IN PROGRESS`.
