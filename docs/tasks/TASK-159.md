# TASK-159 — Исправить pagination пустого Audit Log после фильтрации

Статус: COMPLETED

Источник: feedback Owner во время walkthrough TASK-086, 2026-08-17.

Evidence: Owner screenshot показывает Audit Log с активным category filter, empty
state, номером страницы `2` и доступной кнопкой `Sonraki` (`Next`). Нажатие продолжает
увеличивать номер, хотя записей для отображения нет.

## Проблема

Pagination Audit Log не учитывает изменение filters и фактическое наличие следующей
страницы. Пользователь может переходить по бесконечным пустым страницам; empty state
при этом противоречит активной кнопке `Next`.

## Ожидаемый результат

- Любое изменение category, actor, entity или date filter сбрасывает pagination на
  первую страницу.
- При нулевом результате `Previous` и `Next` disabled, номер не увеличивается.
- `Next` доступна только когда backend/query действительно сообщает о следующей
  странице; короткая последняя страница завершает pagination.
- `Previous` недоступна на первой странице и корректно возвращает с последующих.

## Критерии готовности

- Нельзя перейти на пустую page 2+ из empty или последней result page.
- При фильтрации с текущей page > 1 интерфейс атомарно возвращается на page 1 без
  краткого показа неверного empty state.
- Loading/error states не позволяют повторными кликами перескочить границы.
- Disabled state визуально и семантически понятен на English/Turkish, включая
  keyboard/screen-reader behavior.
- Audit store/Owner scope и server-side filters не ослабляются.

## Проверки

- Component tests: empty, one page, exact full page, multiple pages и filter reset.
- Rapid filter/page interaction и stale-response regression.
- Desktop/mobile EN/TR walkthrough.
- `npm run build`.

## Ограничение

Не начинать исправление, пока Owner не сообщит, что сбор проблем TASK-086 завершён.

## Результат — 2026-08-20

- Category, actor, entity и date filter теперь атомарно возвращают Audit Log на
  page 1. Пока новый запрос загружается, старый empty/result state не показывается.
- Pagination доступна только в `ready`: Previous только после первой страницы,
  Next только для непустого результата, когда query сообщает `hasMore`. Empty,
  loading, error и короткая последняя страница не позволяют перейти дальше.
- Stale response предыдущей страницы игнорируется существующей cancellation guard;
  это покрыто отдельным rapid page/filter regression test.
- Scope Owner/store и server-side category query не менялись.

## Evidence

- Component tests: empty, one/last page, multiple pages, all filter resets и stale
  response PASS; EN/TR disabled controls проверены.
- Full Vitest: 84 files / 211 tests PASS.
- Demo и live production builds PASS; 0 новых lint errors (23 existing warnings).
- Targeted Playwright Owner Audit Log smoke: desktop/tablet/mobile 3/3 PASS.
