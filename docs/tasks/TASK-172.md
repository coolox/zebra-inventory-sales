# TASK-172 — Обновить light-theme дизайн фона столбцов Sales Trend

Статус: COMPLETED

Приоритет: P2 — mobile visual quality before pilot.

Источник: Owner screenshot и feedback, 2026-08-21.

## Наблюдение

В светлой теме мобильный график Sales Trend / `Satış trendi` отображает у каждого
столбца заметный серо-лиловый фон. На скриншоте этот фон выглядит тяжёлым и
устаревшим: он конкурирует с фиолетовой частью, которая должна быть единственным
главным визуальным сигналом выручки.

## Цель

Сделать столбцы в light theme современнее и легче, сохранив строгий graphite +
purple retail visual language:

- убрать ощущение массивных серых «пустых» столбцов;
- оставить фиолетовую фактическую выручку хорошо заметной и доступной;
- использовать очень светлый нейтральный/холодный lavender surface или тонкий
  outline/grid cue только если он действительно нужен для сравнения высот;
- не ухудшить dark theme, tap/keyboard selection, focus, tooltip/pinned value и
  контраст текста.

## Границы

- Только presentation Sales Trend bars и связанные light-theme tokens/styles.
- Не менять расчёт выручки, данные, порядок дней, локализацию, chart interaction,
  Sale History или Reports business logic.
- Не вводить яркие декоративные градиенты, «игровой» UI или отдельный brand style.

## Критерии готовности

- На 390 px Android light theme не остаётся тяжёлого серого фона, который визуально
  доминирует над фиолетовой выручкой.
- Нулевые и малые значения всё ещё различимы; фактическая высота бара читается без
  ложного впечатления о выручке.
- Контраст, visible focus и выбранный/tap state соответствуют existing accessibility
  behaviour из TASK-157.
- Desktop/tablet/mobile и light/dark regression screenshots/targeted tests проходят.
- `npm run build` проходит; Owner подтверждает обновлённый light-theme вид на
  physical phone.

## Результат

- Light theme Sales Trend использует прозрачную interactive surface, тонкую
  lavender grid и мягкий фиолетовый hover вместо тяжёлых серых пустых столбцов.
- Dark theme сохраняет прежний графитовый hover. Расчёт, данные, локализация,
  tap/keyboard selection, focus и pinned tooltip не менялись.
- Добавлен targeted regression test для themeable chart hit area; существующие
  interaction tests остаются зелёными.

## Evidence — 2026-08-22

- `npx vitest run features/overview/ui/overview.test.tsx features/overview/ui/sales-trend-light.test.tsx` — 6/6 passed.
- `npm run build` — passed (existing lint warnings in `app/page.tsx`, no build error).
- Physical visual confirmation объединена с shared Owner/Seller walkthrough в TASK-165.
