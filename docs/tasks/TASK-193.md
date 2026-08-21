# TASK-193 — Сделать light-theme action controls различимыми и читаемыми

Статус: COMPLETED

Приоритет: P1 — действия в light theme выглядят неактивными или нечитаемыми.

Источник: Owner local-demo screenshots, 2026-08-22.

## Наблюдение

В light theme несколько action controls имеют слишком бледный lavender foreground
на почти белой surface. На screenshots плохо читаются в том числе controls
`Listeyi gör`, `Kontrolleri gör`, `Başka ürün ekle` и `Archived products`.
Пользователь не может уверенно понять, доступно ли действие, disabled ли оно или
перед ним loading state.

## Цель

Разделить semantic states без изменения доступности действий:

- enabled secondary action имеет явный контрастный text/icon, border/surface и
  hover/pressed/focus state;
- disabled action остаётся disabled, но его label/icon читаемы и визуально явно
  отличаются от enabled/loading;
- loading не маскируется под disabled;
- dark theme и существующая строгая retail visual hierarchy не регрессируют.

## Границы

- Только presentation/tokens action controls в light theme.
- Не менять conditions, permissions, form validation, stock/sale rules, async flow
  или данные.
- Проверить desktop/mobile, EN/TR, keyboard focus и relevant error/empty states.

## Критерии готовности

- Text/icon каждого supported light-theme action остаются читаемыми без zoom/guessing.
- Enabled, disabled и loading state невозможно спутать по visual treatment.
- Existing disabled semantics, keyboard behavior и screen-reader labels сохраняются.
- Targeted component/browser visual checks и production build проходят.

## Ограничение Owner

Не начинать implementation до прямой команды Owner после закрытия renewed visual
intake.

## Реализация и evidence

- `secondary-action` даёт enabled actions в light theme тёмный violet foreground,
  ясный border/surface, hover/active state; disabled controls остаются semantic
  disabled, но получают нейтральный читаемый foreground без opacity ambiguity.
- Применено к Low stock, Reconciliation, Sale Flow `Add another item` и Owner
  inventory actions, включая Archived products. Dark theme не переопределяется.
- Targeted Vitest: `low-stock-report`, `discrepancy-report`, `sale-flow` —
  17/17 passed. `npm run build` — passed (only existing warnings).
- Local Chrome light-theme check подтвердил computed contrast для View list и
  View checks: `#4c1d95` foreground на `rgba(124,58,237,.12)` surface.
