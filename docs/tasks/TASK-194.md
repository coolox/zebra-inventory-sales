# TASK-194 — Восстановить контраст selected category в light-theme Audit Log

Статус: pending

Приоритет: P1 — active Audit category не читается и не выглядит выбранной.

Источник: Owner local-demo screenshots, 2026-08-22.

## Наблюдение

В light-theme Audit Log выбранные category chips (`Sale`, `Catalog`) получают
lavender border/surface, но foreground становится слишком светлым. Active filter
виден хуже, чем unselected controls, поэтому нельзя уверенно прочесть значение или
понять текущий filter.

## Цель

Сделать selected Audit category контрастной и однозначной в light theme: readable
foreground, distinct selected surface/border и visible keyboard focus.

## Границы

- Только Audit Log category chip presentation for light theme.
- Не менять internal category keys, filtering, pagination reset, loading/error/empty
  behavior, RLS/audit data или dark-theme treatment.
- Проверить EN/TR, touch, keyboard and all category values.

## Критерии готовности

- Active chip text/icon читается и visually stronger than unselected chips.
- Selected/focus/hover/disabled states различимы друг от друга.
- Filter results и pagination behavior не меняются.
- Targeted UI/browser checks и production build проходят.

## Ограничение Owner

Не начинать implementation до прямой команды Owner после закрытия renewed visual
intake.

