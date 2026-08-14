# TASK-141 — Показать Seller store и personal sales summary

Статус: pending

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
