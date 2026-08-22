# TASK-197 — Объединить Product edit actions и поставить Sell первым

Статус: COMPLETED

Приоритет: P2 — Product Details mobile action hierarchy перегружена и скрывает
главный сценарий продажи.

Источник: Owner local-demo Product Details screenshot, 2026-08-22.

## Наблюдение

Текущий mobile Product Details показывает отдельные buttons `Ürünü düzenle` и
`Ürün kodunu düzenle` перед primary sale action. Это разделяет один Owner edit
сценарий на два действия и ставит management controls выше ключевого действия
продавца `Bu ürünü sat`.

## Цель

Построить ясную action hierarchy:

1. первая visible primary action — `Sell this product` / `Bu ürünü sat`;
2. Owner видит одну secondary action `Edit product` / `Ürünü düzenle` ниже primary
   sale action, а не две отдельные edit buttons наверху;
3. unified edit dialog даёт доступ к ранее approved fields: Product code, name,
   gender, low-stock threshold, current purchase cost and currency;
4. Movement History, Adjust Stock и Archive остаются отдельными actions ниже
   primary sell/edit hierarchy.

## Важная граница

UI объединяется, но server-side boundaries сохраняются: Product code остаётся
Owner-only audited correction с exact server confirmation (TASK-176); model details
остаются Owner-only audited edit (TASK-177). Не обещать UI success, пока каждый
изменённый authorised server result не подтверждён; partial/error state сохраняет
draft и объясняет, что произошло.

## Границы

- Только Product Details action order and unified edit presentation.
- Не менять seller access, sale action semantics, Product code/model details RPC,
  audit fields, historical ledger/photos, stock, archive or permissions.
- Проверить EN/TR, Owner/Seller difference, mobile/desktop, keyboard/focus and
  loading/error/partial-save states.

## Критерии готовности

- `Sell this product` — первая и visually primary Product Details action for a
  sellable product.
- Owner не видит duplicate edit buttons; один edit entry point открывает clear
  unified form for approved fields.
- Seller не получает product edit controls.
- Server validation/audit/exact code confirmation сохраняются; failed code/details
  save не закрывает форму и не показывает false success.
- Targeted UI/data tests and production build проходят; Owner visual acceptance
  подтверждает порядок на mobile.

## Ограничение Owner

Не начинать implementation до прямой команды Owner после закрытия renewed visual
intake.

## Реализация и evidence

- Product Details now renders its sellable primary action first. Owner receives one
  `Edit product` / `Ürünü düzenle` entry point below it; it exposes the approved
  details and product-code save sections without duplicating the old two actions.
- Detail and code saves retain their separate existing callbacks, validation,
  server-confirmed code result and error states; Seller still receives no edit
  control. Movement history, stock adjustment and archive remain below.
- `npm test -- --run features/catalog/ui/product-card.test.tsx` — 15/15 passed.
- `npm run build` — demo build passed (only existing warnings).
