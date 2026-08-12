# TASK-064 — Добавить Cancellation UI

Статус: pending

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

