# TASK-054 — Подключить demo workspace к persistence adapter

Статус: pending

## Цель

Сохранять demo sales, receipts, inventory, sellers и preferences между reload.

## Предполагаемые файлы

- `features/workspace/model/workspace-data.ts`
- `app/(dashboard)/layout.tsx` или `app/page.tsx`

## Зависимости

TASK-016, TASK-051, TASK-053.

## Критерии готовности

- Demo mutations сохраняются и восстанавливаются.
- Есть явный Reset demo data.
- Hydration не вызывает mock/live flash.

## Тесты

- Component reload persistence tests.
- Playwright create/reload/reset scenario.
- Build.

