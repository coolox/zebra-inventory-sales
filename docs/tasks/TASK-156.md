# TASK-156 — Исправить дублирование total в Sales History для multi-item sale

Статус: COMPLETED

Приоритет: P0 до проверки ledger; если данные не задублированы, UI P1.

Источник: feedback Owner во время walkthrough TASK-086, 2026-08-17.

Evidence: Owner screenshot показывает две отдельные confirmed карточки Sales History
в одно время, каждая с `1 items` и общей суммой `€150.00`, после одной продажи двух
вещей с line prices €50 и €100. Screenshot не содержит customer data и не копируется
в репозиторий.

## Проблема

Одна multi-item sale визуально представлена как две продажи, причём каждой строке
присвоен полный sale total €150. Это создаёт впечатление выручки €300 и не позволяет
понять состав одного чека.

По screenshot нельзя доказать, ограничена ли ошибка presentation mapping или также
созданы дублирующие `sales`, payments либо inventory movements. До проверки ledger
повторять операцию с целью обхода ошибки нельзя.

## Ожидаемая семантика Owner

- Sales History показывает одну карточку продажи на €150 и `2 items`.
- Detail показывает две строки с соответствующими ценами €50 и €100.
- Sale-level total и payments не повторяются как total каждой товарной строки.
- Reports/revenue учитывают эту продажу один раз.

## Диагностика перед исправлением

- По безопасному internal identity проверить количество `sales`, `sale_lines`,
  `sale_payments` и `inventory_movements` для операции; не записывать UUID или
  contact data в task/log.
- Определить pricing mode (`per_item` или `sale_total`) и сравнить raw RPC response с
  client mapping Sales History.
- Проверить reconciliation: payment mismatch, missing/duplicate movement и balance.

## Критерии готовности

- Multi-item transaction отображается одной history entry с правильным total и
  item count на mobile/desktop.
- Detail показывает корректные per-line amounts без умножения sale total.
- Single-item, per-item, total-price, mixed-payment, cancellation и exchange history
  не получают регрессий.
- Owner store scope и Seller own-sales scope остаются server-side защищёнными.
- Если найдены дублирующие ledger записи, cleanup выполняется только отдельным
  Owner-approved audited/compensating flow; immutable history напрямую не правится.

## Проверки

- Unit/integration regression: одна sale, две lines (€50 + €100), один total €150.
- RPC/database assertions для sale/payment/movement cardinality и reconciliation.
- Sales History detail mobile/desktop walkthrough.
- `npm run build`.

## Ограничение

Не начинать диагностику данных или исправление, пока Owner не сообщит, что сбор
проблем TASK-086 завершён. Production не затрагивать.

## Прогресс исправления — 2026-08-17

- Backend/RPC review подтвердил одну строку `sales`, две `sale_lines`, общий payment
  и отдельные inventory movements: screenshot вызван frontend presentation mapping,
  а не доказанным duplicate ledger.
- `toSaleHistory` теперь группирует line DTO по `sale_id`; ticket содержит один EUR
  total, total quantity и точные line totals. UI открывает один ticket detail с
  двумя строками; cancellation остаётся sale-level, exchange — exact line-level.
- Regression покрывает €50 + €100 как одну карточку €150 / 2 items и line totals
  €50/€100, а также exchange/cancellation/filter scope.
- Проверки: TypeScript PASS; 81 Vitest files / 192 tests PASS; lint 0 errors и 24
  pre-existing warnings; demo/live production builds PASS; Playwright 57/57 PASS на
  desktop/tablet/mobile.
- Новый Vercel target `preview` собран в live mode и имеет status `Ready`:
  `https://zebra-inventory-sales-iey5w0tiw-cooloxs-projects.vercel.app`.
  Public smoke: `/` → `/login`, login UI загружен.
- По явному подтверждению Owner staging Supabase Auth Site URL переключён на
  `https://zebra-inventory-sales-iey5w0tiw-cooloxs-projects.vercel.app`, а exact
  callback `/auth/callback` добавлен в redirect allow list. Supabase UI подтвердил
  `Successfully updated site URL` и `Successfully added 1 URL`; старые staging и
  localhost callback сохранены для rollback/development. Production не изменялся.
- После deployment TASK ожидала authenticated Owner smoke: войти через Magic Link
  на новом Preview и подтвердить одну карточку €150 / 2 items с detail €50 + €100.

## Owner acceptance — 2026-08-17

- Owner вошёл на обновлённый staging Preview и подтвердил, что дефект исправлен.
- Multi-item sale больше не отображается как две продажи с повторным total.
- TASK-156 принята Owner и завершена; Production не изменялся.
