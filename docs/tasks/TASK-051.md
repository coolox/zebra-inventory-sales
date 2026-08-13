# TASK-051 — Вынести Seller management feature

Статус: COMPLETED

## Цель

Перенести список, invite form и status actions продавцов из dashboard page.

## Предполагаемые файлы

- `features/sellers/ui/seller-manager.tsx`
- `app/page.tsx`

## Зависимости

TASK-036, TASK-038, TASK-047.

## Критерии готовности

- Live и demo sources передаются через явный adapter.
- Owner-only actions отсутствуют у Seller.
- Page не содержит seller form state.

## Тесты

- Component role/live/demo tests.
- `npx tsc --noEmit`.
- Build.

## Результат

- Список, приглашение и status actions объединены в `SellerManager` с явными callback adapters для live/demo.
- Seller получает пустой компонент и не видит administrative actions; role test, TypeScript и build проходят.
- TASK-051 подтверждает наличие реализации status UI, но не закрывает TASK-038 автоматически: её отдельные staging visual и mobile layout smoke ещё не зафиксированы.
