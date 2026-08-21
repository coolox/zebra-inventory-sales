# TASK-158 — Улучшить mobile layout короткого Movement History

Статус: COMPLETED

Источник: feedback Owner во время walkthrough TASK-086, 2026-08-17.

Evidence: Owner screenshot с телефона показывает Movement History с одной записью
как низкую bottom sheet у самого нижнего края и большой пустой затемнённой областью
над ней.

## Проблема

При малом числе inventory movements окно истории визуально теряется внизу экрана и
выглядит незавершённым. Важные header и единственная запись находятся слишком низко,
хотя свободного места достаточно. Нужны более высокое размещение, адаптивный размер
и согласованный с Zebra dashboard дизайн.

## Явное решение Owner

- На телефоне Movement History должно открываться заметно выше, а не оставаться
  тонкой панелью у нижнего края при одной/нескольких записях.
- Высота и композиция должны адаптироваться к количеству записей.
- Окно должно иметь аккуратный, понятный визуальный дизайн.

## Критерии готовности

- Short history (0–2 rows) расположен в визуально естественной верхней/центральной
  области mobile viewport и не создаёт впечатление случайно обрезанной sheet.
- Long history имеет ограниченную viewport height, внутренний scroll и доступный
  header/close action.
- Product/variant context, movement amount, type, actor, timestamp и description
  имеют ясную визуальную иерархию.
- Light/Dark, English/Turkish и safe-area insets отображаются согласованно.
- Modal сохраняет focus management, background scroll lock и закрытие без потери
  текущей позиции основной страницы.
- Данные, store scope и Owner/Seller authorization Movement History не меняются.

## Проверки

- Component/layout cases: empty, one, two и long movement lists.
- Mobile viewport visual QA на iPhone/Android; desktop regression.
- Keyboard/focus/close accessibility checks.
- `npm run build`.

## Ограничение

Не начинать исправление, пока Owner не сообщит, что сбор проблем TASK-086 завершён.

## Результат — 2026-08-20

- Movement History использует центрированный mobile layout с safe-area padding:
  короткие empty/one/two-row истории больше не выглядят тонкой bottom sheet.
- Длинный список ограничен высотой viewport, имеет внутреннюю прокрутку, sticky
  header и доступную кнопку закрытия.
- Modal блокирует background scroll и восстанавливает его при закрытии. Для
  Movement History добавлен явный focus-return target на кнопку выбранного variant.
- Данные, store scope, live RPC и Owner/Seller authorization не менялись.

## Evidence

- Component tests: loading/empty (EN/TR), one, two и 18-row history; mobile
  placement, internal scroll, scroll lock, Escape и explicit focus return — PASS.
- Full Vitest: 84 files / 208 tests PASS.
- Demo и live production builds PASS; 0 новых lint errors (23 existing warnings).
- Targeted Playwright layout smoke: desktop, tablet и mobile PASS.
