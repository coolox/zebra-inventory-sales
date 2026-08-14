# TASK-144 — Завершить launch-critical English/Turkish pass

Статус: COMPLETED

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

## Выполнено

- Supplier Manager получил полный EN/TR copy для controls, empty/validation/error
  states; switching locale сохраняет введённые данные формы.
- Owner Supplier и Inventory Count controls возвращены в активный Inventory header:
  они больше не остаются внутри отключённого legacy блока. FX entry-point, base
  currency badge и close action локализованы.
- Inventory list больше не содержит hardcoded `pcs`/`SKU`: использует locale contract.
  Owner-only actions скрыты для Seller, а layout сохраняет две короткие action-кнопки
  в mobile grid без горизонтального overflow.

## Evidence

- `npm test -- --run` — 75 files / 177 tests passed.
- `npm run build:demo` и `npm run build:live` — passed.
- `npm run lint` — 0 errors, 24 pre-existing warnings.
- Local browser smoke: Turkish Owner открыл Supplier и FX controls с Turkish copy;
  Turkish Seller не видит owner-only actions; at 390 px horizontal overflow отсутствует.

Staging и production не изменялись.
