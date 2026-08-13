# TASK-064 — Добавить Cancellation UI

Статус: COMPLETED

## Цель

Позволить Seller/Owner отменить sale из history с reason и явным подтверждением.

## Предполагаемые файлы

- `features/sales/ui/cancel-sale-dialog.tsx`
- `features/sales/data/cancel-sale.ts`
- `features/sales/ui/sale-history.tsx`

## Зависимости

TASK-063.

## Критерии готовности

- Action виден только для разрешённых confirmed sales.
- Reason обязателен; loading/error/success states понятны.
- History и stock refresh после success.

## Тесты

- Component permission/validation tests.
- Staging cancellation smoke-test.
- Mobile dialog test.

## Выполнено

- Добавлены отдельный reason-required cancellation dialog, Supabase RPC adapter и demo cancellation adapter с восстановлением stock для всех строк sale.
- Action доступен только для `confirmed` sale при переданном разрешении; cancelled sale повторно отменить нельзя.
- Успешная live-операция refreshes workspace, а demo-операция обновляет history и stock локально.
- `npm test -- --run` — 117/117; `npm run build` — PASS; mobile Playwright smoke — 8/8, включая cancellation dialog.
- Migration `20260813010000_sale_cancellation.sql` применена на `zebra-retail-staging`. Авторизованный smoke отменил одну confirmed test sale с причиной `TASK-064 staging smoke`: status/reason/timestamp, точный stock reversal, все payment reversals и `sale.cancelled` audit record подтверждены. Production не изменялся.
