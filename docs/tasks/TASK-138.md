# TASK-138 — Учитывать доплату exchange в общих продажах

Статус: COMPLETED

## Цель

Сохранить demo exchange как отдельное финансовое событие существующего чека и включить positive top-up в общую выручку без создания фиктивной продажи.

## Границы

- Доплата exchange учитывается в Overview revenue, chart, Seller ranking и Owner Reports.
- Tickets и units не увеличиваются из-за exchange.
- Маржа учитывает замену себестоимости исходного товара на новый.
- История исходной продажи показывает новый товар, итоговую сумму и доплату.
- Demo exchange сохраняется после reload.

## Критерии готовности

- Сценарий `sale €100 → exchange top-up €20` даёт Revenue €120, Tickets 1, Units 1.
- Обмен виден в истории исходного чека и повторное действие для той же строки недоступно.
- Unit/component tests и production build проходят.

## Выполнено

- Добавлен versioned `SaleExchange` snapshot, который сохраняется в demo workspace и мигрирует существующий v1 workspace без потери данных.
- Exchange top-up включён в Overview revenue, daily chart, Seller ranking и Owner Reports; tickets/units не увеличиваются.
- Margin delta заменяет себестоимость возвращённого товара себестоимостью нового товара.
- Sales History показывает replacement, итог исходного чека, доплату/валюту и причину; повторная мутация строки заблокирована.

## Проверка

- `npm test -- --run` — 153/153.
- `npm run build` — успешно.
