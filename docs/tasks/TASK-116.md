# TASK-116 — Обновлять FX-курсы перед открытием New Sale

Статус: COMPLETED

## Цель

Не допускать использования устаревших `paymentRates` после того, как Owner сохранил дневные курсы в той же сессии.

## Предполагаемые файлы

- `app/page.tsx`
- `features/sales/data/load-payment-rates.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/UI_REVIEW.md`
- `CHANGELOG.md`

## Зависимости

TASK-115.

## Критерии готовности

- New Sale в live mode перечитывает FX-курсы текущей business date Istanbul непосредственно перед открытием формы.
- Сохранённый Owner курс TRY/USD доступен в Mixed Payment без перезагрузки страницы.
- При ошибке загрузки по-прежнему безопасно блокируются не-EUR платежи.
- EUR остаётся базовой валютой с курсом `1`.

## Тесты

- Unit test mapping курсов из `exchange_rates` в payment rate map.
- Browser smoke: текущий TRY/USD курс в Mixed Payment без создания продажи.
- `npm test`.
- `npx tsc --noEmit`.
- `npm run build`.

## Результат

- Live New Sale теперь перечитывает курсы `exchange_rates` за текущую Istanbul business date перед открытием формы.
- После сохранения Owner FX rates в той же сессии TRY/USD сразу доступны в Mixed Payment; перезагрузка страницы не требуется.
- При ошибке запроса foreign currencies остаются `null`, поэтому форма безопасно блокирует не-EUR оплату вместо использования выдуманного курса.
- Добавлены два unit tests загрузчика rates; полный suite 51/51, TypeScript и production build проходят.
- Browser smoke в live workspace подтвердил `50 EUR + 50 TRY = €50.91`, `Payment is balanced` и активную кнопку продажи без сохранения продажи в staging.
