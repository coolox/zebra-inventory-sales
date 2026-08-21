# TASK-173 — Усилить light-theme affordance action «сохранить и добавить другой цвет»

Статус: COMPLETED

Приоритет: P2 — mobile receive-flow usability before pilot.

Источник: Owner physical walkthrough feedback, 2026-08-21.

## Наблюдение

В light theme action Receive Flow «Сохранить этот товар и добавить другой цвет»
имеет слишком бледный цвет. Кнопка технически видна, но визуально похожа на disabled
control, хотя доступна для нажатия.

## Цель

Сделать доступную secondary action однозначно интерактивной в light theme:

- повысить визуальный контраст текста, border/surface и pressed/focus state;
- использовать более ясный, но не конкурирующий с primary Save, accent;
- оставить настоящий disabled state визуально отличимым от доступной кнопки;
- сохранить graphite + purple retail language, EN/TR copy и mobile touch target.

## Границы

- Только стили и states этой action в Receive Flow и переиспользуемый button variant,
  если он влияет ровно на тот же semantic state.
- Не менять receipt draft, сохранение товара, добавление colour/size, permissions или
  live/Supabase behaviour.

## Критерии готовности

- В light theme доступная action выглядит нажимаемой на 390 px Android и не похожа
  на disabled control.
- Enabled, hover/pressed, focus-visible и disabled states различимы и доступны.
- Primary Save остаётся главным действием; новая secondary action не становится
  визуально сильнее primary.
- Dark theme, EN/TR copy, keyboard/touch behaviour и form submission не меняются.
- Targeted UI regression, `npm run build` и physical mobile recheck проходят.

## Результат

- Enabled action получила отдельный `receipt-add-color` visual treatment в light
  theme: более контрастные lavender surface, border и text; hover/pressed state
  остаётся secondary по отношению к primary Save.
- Disabled semantic state не менялся: нулевая матрица по-прежнему блокирует action,
  а receipt draft, submit, EN/TR copy и touch/keyboard behaviour сохранены.
- Dark theme не переопределяется этим light-theme правилом.

## Evidence — 2026-08-22

- `npx vitest run features/receipts/ui/receive-flow.test.tsx` — 13/13 passed.
- `npm run build` — passed as part of the consolidated remediation build.
- Physical visual confirmation входит в consolidated TASK-165 walkthrough.
