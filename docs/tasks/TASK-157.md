# TASK-157 — Показывать сумму Sales Trend по tap на телефоне

Статус: COMPLETED

Источник: feedback Owner во время walkthrough TASK-086, 2026-08-17.

Evidence: Owner screenshot с телефона показывает Turkish Sales Trend bar chart; tap
по столбцу не выводит точную сумму EUR.

## Проблема

Sales Trend имеет визуальный tooltip из TASK-132, но пользователь телефона не может
получить точное значение столбца нажатием. Высота bar показывает только относительную
величину и недостаточна для чтения суммы продажи/выручки.

## Ожидаемый результат

- Tap по bar выбирает день и показывает точную EUR revenue этого дня.
- Значение остаётся читаемым достаточно долго и обновляется при выборе другого bar;
  есть понятное поведение закрытия.
- Нулевое значение явно показывает €0, а не выглядит как сломанный tap target.
- Mouse hover и keyboard focus продолжают показывать те же day/value данные.
- Tooltip/value и accessibility labels локализованы на English/Turkish.

## Критерии готовности

- Touch interaction работает на iPhone и Android без hover emulation.
- Tooltip не обрезается card/viewport boundaries и не вызывает horizontal overflow.
- EUR formatting совпадает с остальными financial views.
- Chart остаётся читаемым для семи дней и не меняет расчёт revenue.

## Проверки

- Component tests для pointer/touch, mouse, keyboard, zero и non-zero bars.
- EN/TR accessible name и displayed value assertions.
- iPhone/Android manual walkthrough.
- `npm run build`.

## Ограничение

Не начинать исправление, пока Owner не сообщит, что сбор проблем TASK-086 завершён.

## Результат — 2026-08-18

Каждый бар Sales Trend теперь является touch/keyboard-доступной кнопкой. Tap
закрепляет день и его точную EUR сумму в отдельной адаптивной value row; повторный
tap или явная кнопка close снимают выбор. Hover и keyboard focus показывают те же
данные, включая явный `€0`; EN/TR labels и screen-reader names локализованы. Value
row внутри card исключает tooltip clipping и horizontal overflow.

Evidence: component tests покрывают tap/non-zero/zero/close/mouse/keyboard/EN/TR;
full Vitest 83 files / 203 tests, lint 0 errors, demo/live builds и targeted
Playwright 3/3 viewport прошли. Ручной iPhone/Android walkthrough отложен до
общего staging remediation Preview по решению Owner.
