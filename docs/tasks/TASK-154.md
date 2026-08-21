# TASK-154 — Скрыть полный Low stock список на главной странице до запроса

Статус: COMPLETED

Источник: feedback Owner во время walkthrough TASK-086, 2026-08-17.

Evidence: Owner screenshot с iPhone показывает длинный развёрнутый список Low stock,
который занимает основную часть mobile page.

## Проблема

Полный список вариантов с низким остатком постоянно отображается на главной Owner
page. При большом количестве позиций он вытесняет более важную ежедневную информацию
и заставляет долго прокручивать страницу.

TASK-034/TASK-071 уже определяют threshold и формируют корректные low-stock данные;
это feedback к presentation/discoverability, а не запрос на изменение расчёта.

## Явное решение Owner

- Не показывать полный Low stock список на главной странице по умолчанию.
- Оставить понятное действие, по которому Owner может открыть весь список.
- После просмотра должен быть понятный способ вернуться к компактному состоянию.

Точное название и placement действия выбрать при реализации в рамках существующей
English/Turkish navigation. До завершения сбора feedback TASK-086 код не менять.

## Критерии готовности

- Главная Owner page показывает Low stock компактно и не разворачивает все строки
  автоматически.
- По явному нажатию Owner видит полный актуальный список и может снова его скрыть.
- Loading, empty и error states понятны и не выглядят как отсутствие проблем при
  ошибке загрузки.
- Действия и состояния локализованы на English/Turkish.
- Mobile page не получает horizontal overflow и чрезмерную обязательную прокрутку.
- Store scope, threshold logic и Owner/Seller authorization не изменены.

## Проверки

- UI tests для collapsed/expanded, loading, empty/error и EN/TR states.
- Mobile и desktop walkthrough с длинным low-stock fixture.
- Existing low-stock calculation/authorization regression tests.
- `npm run build`.

## Ограничение

Не начинать исправление, пока Owner не сообщит, что сбор проблем TASK-086 завершён.

## Результат — 2026-08-18

- Длинный список Low stock в Reports Dashboard заменён компактной сводкой:
  количество требующих внимания вариантов и явная кнопка View list / Listeyi gör.
- Полный список показывается только по запросу Owner и снова скрывается кнопкой
  Hide list / Listeyi gizle. Широкая таблица заменена адаптивными карточками без
  horizontal overflow.
- EN/TR loading, empty, error и retry состояния реализованы отдельно. При ошибке
  блок показывает ошибку, а не All clear; threshold calculation и store-scoped
  report data не менялись.
- Reports Dashboard остаётся Owner-only, а низкий остаток по-прежнему приходит из
  существующего read-only report pipeline.
- Staging deployment отложен: TASK-152—163 накапливаются для одного Preview и
  следующего ограниченного Magic Link acceptance цикла.

## Evidence

- Component/UI tests: collapsed/expanded, EN/TR, loading, empty/error и retry PASS.
- Full Vitest: 83 files / 200 tests PASS.
- ESLint: 0 errors / 23 pre-existing warnings; TypeScript PASS.
- Demo и live production builds PASS.
- Playwright: 66/66 PASS; long-list on-demand walkthrough и no-horizontal-overflow
  проверены на desktop, tablet и mobile.
