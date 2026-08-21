# TASK-184 — Переработать выбор товара в Exchange Flow: Product code → variant → size

Статус: COMPLETED

Приоритет: P1 — текущий длинный список вариантов делает обмен на mobile непонятным
и повышает риск выбрать неверный товар/размер.

Источник: Owner physical mobile walkthrough screenshot, 2026-08-21.

## Наблюдение

После выбора `Exchange item` открывается native длинный select со всеми вариантами
товаров, например `pantalon · Blue · S (3)`, `dress · black · M (94)`, `T-Shirt ·
Black · L (2)`. На мобильном экране он перекрывает flow и не объясняет, как быстро
найти товар, на который клиент меняет покупку.

## Цель

Построить понятный последовательный Exchange Flow:

1. Ввести или отсканировать Product code нового товара и найти модель.
2. Увидеть подтверждённый name/brand/photo context, доступные цвета и stock.
3. Выбрать цвет, затем доступный размер/variant и quantity.
4. Ввести/подтвердить новую цену и payment difference по существующим business rules.
5. Просмотреть понятную summary до atomic confirmation.

Поиск по Product code является главным быстрым путём; безопасный searchable fallback
может поддерживать name/barcode только если не разрушает code-first identity TASK-117.

## Границы

- Только Exchange picker/presentation/state transitions, accessible mobile controls
  and validation feedback.
- Не менять atomic exchange transaction, stock locking, cancellation semantics,
  seller/store authorization, price/payment/ledger calculations или audit rules.
- Payment difference/top-up presentation и accounting остаются в TASK-171, но новый
  picker обязан передать точный selected variant в её корректный flow.

## Критерии готовности

- Owner/Seller находят новый товар по Product code без прокрутки полного списка
  store variants.
- После code lookup доступны только цвета/размеры выбранной модели с положительным
  разрешённым stock; out-of-stock и несуществующий code имеют clear EN/TR states.
- Selected model, colour, size, quantity, new price and exchange difference ясны до
  confirm; смена кода безопасно сбрасывает incompatible variant draft.
- Mobile dialog не имеет horizontal overflow; keyboard/scanner, touch and keyboard
  navigation доступны; original sale line остаётся clearly visible.
- Existing server-side atomicity/RLS/audit, TASK-171 financial evidence и
  cancellation/exchange regressions сохраняются.
- Targeted UI/data tests, `npm run build` и physical mobile recheck проходят.

## Статус запуска

Owner завершил bug intake в TASK-190 и напрямую запустил TASK-184 2026-08-21.

## Evidence

- Exchange picker now follows Product code/barcode → model → colour → available size;
  price, fixed source-line quantity and top-up summary remain in the existing atomic flow.
- `npx vitest run features/exchanges/ui/exchange-flow.test.tsx` — 4/4 passed.
- `npm run build` — passed (existing lint warnings only).
- Physical mobile acceptance is explicitly batched into TASK-165.
