# TASK-189 — Не обрезать крупные KPI суммы и sale count на Redmi 14

Статус: COMPLETED

Приоритет: P1 — Owner не видит полную financial/sales сумму на мобильном dashboard.

Источник: Owner Redmi 14 Android screenshot, 2026-08-21.

## Наблюдение

На mobile dashboard с большим периодом `Yıl` KPI cards обрезают важные значения:

- Revenue показан как `€10.4…`;
- Sales count показан как `101 a…`;
- Gross margin €6.298 помещается, что указывает на break point/available width issue
  конкретного card value/icon/layout, а не на необходимость скрывать деньги.

Owner требует видеть финансовые суммы и число продаж полностью, без ellipsis.

## Цель

Сделать KPI cards responsive для полного отображения currency/number values на Redmi
14 и supported mobile widths. Допустимы controlled font scaling, numeric formatting,
layout reflow или two-line value, но не truncation/tooltip-only disclosure важной
суммы.

## Границы

- Только KPI card presentation on dashboard (Revenue, Sales и аналогичные monetary
  values where the shared primitive applies).
- Не менять revenue/sales calculations, rounding, currency conversion, time period,
  live data/RPC, role scopes или TASK-183 data mismatch diagnosis.
- Сохранить visual hierarchy, icons, accessible labels and strict retail dashboard
  style in light/dark theme.

## Критерии готовности

- На Redmi 14 и 320–430 px supported widths все monetary KPI и sale counts читаются
  полностью без `…`, horizontal clipping или overlap with icon.
- Formatting сохраняет currency, grouping/decimal precision и locale; значение не
  становится двусмысленным при compact notation.
- Very large EUR/USD/TRY values, 3+ digit counts, EN/TR labels, Today/Week/Month/Year,
  light/dark and text zoom boundaries проверены.
- Cards remain scan-friendly and touch/accessibility behaviour не ухудшается.
- Targeted responsive visual/UI tests, `npm run build` и physical Redmi 14 recheck
  проходят.

## Ограничение текущего этапа

Owner напрямую запустил TASK-189 командой `Выполни TASK-189` 2026-08-21.

## Ход выполнения

- KPI value перенесён на отдельную строку под label/icon: `truncate` удалён,
  controlled `break-words` сохраняет полное значение и при экстремально длинных
  числах переносит его внутри карточки без icon overlap.
- Calculations, locale formatting, data/RPC scopes и period logic не менялись.
- Проверки пройдены: `npx vitest run features/overview/ui/overview.test.tsx`
  (5/5), `npx playwright test e2e/kpi-responsive.spec.ts --project=mobile`
  (320/360/390/430 px и 150% text zoom на 320 px, pass), `npm run build`
  (pass; только существующие lint warnings).
- Current live staging Preview is Ready at
  `https://zebra-inventory-sales-kb56dzquv-cooloxs-projects.vercel.app` and
  includes this implementation. Staging Auth Site URL and exact callback point to
  it; Production was not changed.
- Физическая повторная проверка на Redmi 14 явно перенесена в consolidated
  TASK-165, согласно physical-only gate TASK-190; в этой рабочей среде Android
  device/`adb` недоступен.
