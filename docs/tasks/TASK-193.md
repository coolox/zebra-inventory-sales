# TASK-193 — Сделать light-theme action controls различимыми и читаемыми

Статус: pending

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

