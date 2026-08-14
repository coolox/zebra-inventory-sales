# TASK-144 — Завершить launch-critical English/Turkish pass

Статус: pending

## Цель

Убрать оставшийся mixed-language UI из Clothing Pilot без повторной локализации уже проверенных flows.

## Границы

- Провести targeted audit Owner Supplier/FX controls и оставшихся Inventory controls/states.
- Переиспользовать существующий locale contract и copy modules.
- Не менять business logic, роли, visual language или post-launch AI/Telegram UI.

## Зависимости

TASK-058, TASK-133, TASK-139, TASK-143.

## Критерии готовности

- Все доступные в Clothing Pilot controls имеют English и Turkish labels/errors/empty states.
- Смена locale не сбрасывает форму или выбранный workspace state.
- В UI не остаётся launch-critical hardcoded English при Turkish locale.
- Desktop/mobile layout не деградирует из-за длины Turkish copy.

## Тесты

- Targeted component tests для найденных gaps.
- English/Turkish browser smoke Owner и Seller.
- `npm test`, `npm run build:demo`, `npm run build:live`.
