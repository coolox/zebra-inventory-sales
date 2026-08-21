# TASK-160 — Добавить явный выбор размера в Adjust Stock

Статус: COMPLETED

Приоритет: P1 — риск корректировки остатка не того variant.

Источник: feedback Owner во время walkthrough TASK-086, 2026-08-17.

Evidence: Owner screenshot показывает Adjust Stock для заранее выбранного
`PANTALON · BLUE / M`; внутри формы доступны только current stock, quantity delta и
reason, без отдельного size selector.

## Проблема

Adjust Stock полагается на variant, выбранный до открытия диалога. При работе с
несколькими размерами одного товара Owner должен явно выбрать размер внутри операции,
а уже затем вводить изменение количества. Иначе легко применить `+1` для M или `-3`
для L не к тому variant.

## Явное решение Owner

- Сначала выбрать размер товара.
- После выбора увидеть current stock именно этого размера.
- Затем ввести quantity delta и подтвердить изменение.

## Критерии готовности

- Adjust Stock содержит понятный selector доступных размеров текущего product/colour.
- До выбора size quantity adjustment нельзя подтвердить.
- При смене size current balance обновляется, а неподтверждённый delta не переносится
  скрытно на новый variant.
- Confirmation явно показывает product, colour, size, before, delta и after.
- Каждая подтверждённая корректировка остаётся одной атомарной Owner-only ledger
  operation с обязательной причиной и audit record.
- Нельзя выбрать variant другого store/product; отрицательный final balance по-прежнему
  запрещён server-side.
- Flow работает на mobile/desktop и локализован на English/Turkish.

## Проверки

- Component cases: no selection, M `+1`, switch to L, L `-3`, stale balance/error.
- RPC/authorization/negative-stock regressions TASK-031.
- Movement History показывает правильные size и delta для обеих операций.
- Mobile/desktop walkthrough и `npm run build`.

## Ограничение

Не начинать исправление, пока Owner не сообщит, что сбор проблем TASK-086 завершён.

## Результат — 2026-08-20

- Adjust Stock теперь начинает с явного выбора size текущего product/colour; до
  выбора delta, reason и submit disabled.
- Выбранный size показывает свой current stock. Смена size очищает неподтверждённый
  delta, поэтому изменение не может скрытно перейти на другой variant.
- Перед подтверждением виден summary product, colour, size, before, signed delta
  и after. Для Turkish добавлены соответствующие labels и summary copy.
- Выбранный variant приходит только из variants открытого product/colour и затем
  использует прежний Owner-only atomic adjustment RPC; server-side stock/RLS/audit
  ограничения не менялись.

## Evidence

- Component tests: no selection, M +1, M→L reset, L -3/negative balance и Turkish
  flow PASS.
- Full Vitest: 84 files / 213 tests PASS; targeted adjustment/product-card tests
  повторены после integration fix.
- Demo и live production builds PASS; 0 новых lint errors (23 existing warnings).
