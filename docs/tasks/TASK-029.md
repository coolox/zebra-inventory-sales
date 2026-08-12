# TASK-029 — Добавить query истории inventory movements

Статус: COMPLETED

## Цель

Получать аудируемую хронологию движений выбранного variant с actor и source.

## Предполагаемые файлы

- `features/inventory/data/load-movement-history.ts`
- `features/inventory/model/types.ts`

## Зависимости

TASK-012.

## Критерии готовности

- Query ограничен active store membership.
- Результат нормализует receipt/sale/adjustment/exchange sources.
- Empty и error states различимы.

## Тесты

- Data mapper unit tests.
- RLS integration test.
- `npx tsc --noEmit`.

## Результат

- Добавлен `loadMovementHistory`: запрос всегда ограничен `store_id` и `variant_id`, использует существующую RLS policy active membership и возвращает пустой массив только для действительно пустой истории.
- Добавлен нормализованный контракт: receipt, sale, adjustment, exchange, transfer, write-off и sale cancellation, а также actor/reason/receipt-line reference. Ошибки Supabase пробрасываются отдельно от empty state.
- Добавлены mapper tests и pgTAP regression для member/outsider read boundary.

## Проверка

- `npm run test` — 59/59 passed.
- `npx tsc --noEmit` — passed.
- `npm run build` — passed.
- Новый pgTAP test добавлен в local suite; перед staging apply повторить `npm run supabase:verify` в доступном Docker/local Supabase окружении.
