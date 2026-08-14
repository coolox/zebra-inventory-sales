# TASK-141 — Показать Seller store и personal sales summary

Статус: COMPLETED

## Цель

Показать Seller понятный sales dashboard: продажи всего его магазина за today/week и его личные продажи за today/week/month/year/all time.

## Границы

- Использовать только API из TASK-140; запрещены client-side mock fallback и расчёт по неполной Sales History.
- Для store summary не показывать имена или личные результаты других Seller.
- Показать EUR revenue и units в компактных карточках, с понятными периодами и loading/empty/error states.
- Локализовать English/Turkish и проверить mobile-first layout.

## Зависимости

TASK-140.

## Критерии готовности

- Seller видит Store today и Store week, а также пять personal periods.
- Данные обновляются после успешной Sale/Cancellation/Exchange операции.
- Owner UI и Owner-only Reports не меняют доступность для Seller.

## Тесты

- Component tests role/loading/empty/error/refresh.
- Browser smoke Seller desktop/mobile.
- `npm test` и `npm run build`.

## Результат

- Добавлен Seller-only блок `Sales summary`: store today/week и personal today/week/month/year/all time, каждый с EUR revenue и units.
- Блок использует только `get_seller_sales_summary` через typed adapter из TASK-140; в demo нет расчёта или подстановки данных.
- Есть локализованные English/Turkish loading, empty, error/retry и live-unavailable состояния. В live-режиме сводка обновляется после обновления sales/exchanges workspace, в том числе после Sale, Cancellation и Exchange.
- Owner не получает этот Seller UI и не меняются Owner-only Reports.
- Пройдены `npm test` (73 files / 172 tests), `npm run build` и Seller smoke в production-like demo shell: desktop/tablet/mobile 3/3. Staging и production не изменялись.
