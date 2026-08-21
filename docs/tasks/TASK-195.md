# TASK-195 — Сделать Sale Flow warning readable в light theme

Статус: COMPLETED

Приоритет: P1 — важное stock/duplicate warning почти не видно.

Источник: Owner local-demo screenshot, 2026-08-22.

## Наблюдение

После повторного добавления Product code Sale Flow correctly shows Turkish warning
`Bu beden zaten satışta ve başka ürün kalmadı.`, но amber text почти сливается с
светлой amber surface. Пользователь видит, что появилась полоска, но не может
прочесть причину и безопасно понять, почему line quantity равна zero.

## Цель

Сохранить warning semantics и сделать message clearly readable in light theme:
достаточный foreground/background/border contrast, понятная связь с duplicate/out-
of-stock condition и readable EN/TR copy.

## Границы

- Только Sale Flow warning/validation presentation for light theme.
- Не менять duplicate-line reservation, cart quantities, stock calculation,
  payment logic, confirmation or server writes.
- Проверить duplicate Product code, out-of-stock, mixed currency and mobile layout.

## Критерии готовности

- Warning text читается на supported light-theme widths без zoom.
- Alert remains distinguishable from error, success, disabled and informational
  states; its accessible semantics сохраняются.
- Duplicate/out-of-stock logic и cart totals не меняются.
- Targeted UI/browser checks и production build проходят.

## Ограничение Owner

Не начинать implementation до прямой команды Owner после закрытия renewed visual
intake.

## Реализация и evidence

- Duplicate/out-of-stock status keeps its `role="status"` and business logic, and
  now has a light-theme amber surface/border with dark `#7a3500` foreground.
- The duplicate reservation test asserts the warning treatment while preserving
  cart quantity and successful sale behaviour.
- `npm test -- --run features/sales/ui/sale-flow.test.tsx` — 11/11 passed.
- `npm run build` — demo build passed (only existing warnings).
