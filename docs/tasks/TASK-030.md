# TASK-030 — Добавить UI истории движения товара

Статус: COMPLETED

## Цель

Показывать движение выбранного variant из Product Card или Inventory без перегрузки основного списка.

## Предполагаемые файлы

- `features/inventory/ui/movement-history.tsx`
- `features/catalog/ui/product-card.tsx`

## Зависимости

TASK-024, TASK-029.

## Критерии готовности

- Показаны дата, type, signed quantity, actor и reason.
- Есть loading/empty/error/retry states.
- UI работает на mobile и desktop.

## Тесты

- Component tests всех состояний.
- Keyboard dialog test.
- Browser responsive smoke-test.

## Результат

- В Product Card выбранный color/size variant можно открыть через `Movement history`; основная таблица Inventory остаётся компактной.
- История показывается отдельным адаптивным dialog без вложенных modal: дата Istanbul, type, signed quantity, actor и reason. Есть loading, empty, error и keyboard-accessible retry states.
- Общий Modal вынесен в компонент и закрывается клавишей Escape; после закрытия истории карточка выбранной модели возвращается.

## Проверка

- `npm run test` — 64/64 passed.
- `npx tsc --noEmit`, `npm run build` и `git diff --check` — passed.
- Browser smoke выполнен на чистом demo production build: desktop и 390×844 mobile; history dialog открывается один раз, empty state и Close доступны.
