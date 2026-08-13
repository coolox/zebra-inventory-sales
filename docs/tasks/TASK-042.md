# TASK-042 — Добавить Owner Audit Log UI

Статус: COMPLETED

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

## Выполнено

- Owner получает audit dialog с category, actor, entity и date filters, pagination и loading/empty/error states.
- Карточка события показывает action, entity, actor, time и только допустимые scalar details; email, phone, token, password и secret keys скрываются.
- Seller открывает обычную Activity feed вместо Audit Log.
- Component tests покрывают category/actor filtering, pagination и suppression sensitive metadata; desktop browser smoke покрывает Owner/Seller boundary и пустой state.
