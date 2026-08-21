# TASK-153 — Скрыть Reconciliation до запроса и завершить Turkish localization

Статус: COMPLETED

Источник: feedback Owner во время walkthrough TASK-086, 2026-08-17.

Evidence: Owner screenshot с iPhone показывает полностью развёрнутый блок
`Reconciliation` на основной странице и English-only labels/content при проверке
локализации.

## Проблема

Диагностический Owner-only отчёт Reconciliation занимает значительную часть главной
страницы и непонятен в повседневной работе. Он нужен только при проверке расхождений,
поэтому постоянно показывать полный список не требуется. Заголовки, пояснение,
кнопка и строки отчёта также не переведены на Turkish.

## Явное решение Owner

- Не показывать развёрнутый Reconciliation на главной странице по умолчанию.
- Открывать его только по явному действию пользователя (`View` / Turkish equivalent)
  либо перенести в понятное вторичное место с доступом по запросу.
- Полностью перевести пользовательский текст блока на Turkish.

Окончательный вариант размещения и названия действия выбрать при реализации с
учётом существующей Owner navigation; до завершения сбора feedback TASK-086 код не
менять.

## Критерии готовности

- Основная Owner page не загружена длинным списком reconciliation rows по умолчанию.
- Owner может очевидно открыть, обновить и снова скрыть отчёт при необходимости.
- Заголовки, описание, действия, type labels, explanations, empty/error states имеют
  English и Turkish translations.
- На mobile блок не создаёт horizontal overflow и не вытесняет основные ежедневные
  действия.
- Reconciliation остаётся read-only и Owner-only; RLS/RPC authorization не
  ослабляется.
- Известные `manual_correction` review rows отображаются как требующие проверки, а не
  как автоматически доказанная ошибка.

## Проверки

- UI tests для hidden/visible/refresh, empty/error states и EN/TR.
- Owner/Seller authorization regression.
- Mobile и desktop walkthrough.
- `npm run build`.

## Ограничение

Не начинать исправление, пока Owner не сообщит, что сбор проблем TASK-086 завершён.

## Результат — 2026-08-18

- Reconciliation больше не запрашивается и не раскрывается при загрузке основной
  Owner page. Открытие выполняется только кнопкой View checks / Kontrolleri gör;
  после просмотра Owner может обновить или скрыть блок.
- Широкая таблица заменена адаптивными карточками без горизонтального вытеснения.
  Технические reference IDs спрятаны в раскрываемый read-only блок.
- Все пользовательские элементы Reconciliation имеют EN/TR copy: заголовок,
  описание, actions, loading, empty/error/retry, type labels, expected/actual и
  explanations. Backend summary не выводится, поэтому English server text не
  попадает в Turkish UI.
- manual_correction показывается как Review required / İnceleme gerekli с
  пояснением, что это не доказанная ошибка. Owner-only UI boundary и существующий
  Owner-only RPC/RLS не менялись.
- Staging deployment намеренно отложен: TASK-152—163 собираются в общий Preview до
  следующего ограниченного Magic Link acceptance цикла.

## Evidence

- Component tests: hidden/open/refresh/hide, Owner/Seller boundary, EN/TR,
  manual-correction review и retry PASS.
- Full Vitest: 82 files / 198 tests PASS.
- ESLint: 0 errors / 23 pre-existing warnings; TypeScript PASS.
- Demo и live production builds PASS.
- Playwright: 63/63 PASS; Owner on-demand reconciliation walkthrough пройден на
  desktop, tablet и mobile.
