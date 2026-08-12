# TASK-042 — Добавить Owner Audit Log UI

Статус: pending

## Цель

Показать владельцу фильтруемый журнал actor/action/entity/date с деталями операции.

## Предполагаемые файлы

- `features/audit/ui/audit-log.tsx`
- `app/page.tsx`

## Зависимости

TASK-041.

## Критерии готовности

- Есть filters, pagination, loading/empty/error states.
- Seller не видит раздел.
- Sensitive metadata не отображается.

## Тесты

- Component filter/pagination tests.
- Role visibility test.
- Desktop/mobile browser smoke-test.

