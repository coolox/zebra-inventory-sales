# TASK-199 — Восстановить контраст light-theme error и active controls на staging

Статус: pending

Приоритет: P1 — важный live error и выбранный Audit filter нельзя прочитать на
физическом Android в light theme.

Источник: Owner staging Redmi walkthrough screenshots, 2026-08-22.

## Наблюдение

На staging Preview розовый `Store data could not be loaded` surface показывает
практически такой же бледно-розовый текст и `Retry`. В Audit Log активный `Tümü`
также остаётся нечитаемым на lavender surface. Это регрессия/непокрытая часть
TASK-193—TASK-195: на физическом устройстве пользователь не может прочесть
состояние, даже когда видит его фон.

## Цель и границы

- В light theme error text/button и active Audit category получают тёмный,
  контрастный foreground и различимые enabled/disabled/focus states.
- Не менять error source/retry semantics, data loading, Audit category keys,
  pagination, RLS или dark theme.
- Проверить physical mobile light theme и existing targeted tests.

## Критерии готовности

- `Store data could not be loaded` и `Retry` читабельны на pink error surface.
- Active Audit category читаема и сильнее inactive chip на Redmi/iPhone.
- Text/error/accessibility semantics и filtering не меняются; targeted tests/build
  проходят.

