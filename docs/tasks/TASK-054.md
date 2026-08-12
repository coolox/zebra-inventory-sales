# TASK-054 — Подключить demo workspace к persistence adapter

Статус: completed

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

## Результат

- После hydration demo workspace читает versioned localStorage snapshot и сохраняет products, sales, sellers и activity после каждой demo mutation.
- Live mode не читает и не записывает demo storage.
- Добавлена явная кнопка Reset demo data, возвращающая workspace к mock baseline.
- Проверены persistence unit tests, production build и Playwright reload/reset smoke на desktop, tablet и mobile.
