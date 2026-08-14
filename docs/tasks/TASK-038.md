# TASK-038 — Добавить Seller status management UI

Статус: COMPLETED

## Цель

Показывать pending/active/blocked Sellers и действия deactivate/reactivate владельцу.

## Предполагаемые файлы

- `features/sellers/ui/seller-list.tsx`
- `features/sellers/data/update-seller-status.ts`

## Зависимости

TASK-036, TASK-037.

## Критерии готовности

- Owner видит status и доступный action.
- Seller UI не содержит административных действий.
- Оптимистическое состояние откатывается при ошибке.

## Тесты

- Component role/state tests.
- Staging deactivate/reactivate smoke-test.
- Mobile layout test.

## Проверка учёта 2026-08-13

- Реализация UI фактически появилась в рамках TASK-051: Owner видит `pending`/`active`/`blocked`, получает доступное действие deactivate/reactivate, а Seller не получает административный компонент.
- `SellerList` оптимистично меняет status и возвращает предыдущее состояние при ошибке adapter; это покрыто component test.
- Повторно выполнены `seller-list.test.tsx` и `seller-manager.test.tsx`: 4/4 tests проходят.
- TASK остаётся `pending`, потому что в репозитории нет зафиксированного visual smoke через staging UI и отдельного mobile layout smoke. Backend staging smoke из TASK-037 не заменяет эти два UI-критерия.

## Финальное evidence (2026-08-15)

- В Owner staging Seller team UI тестовый active Seller был переведён
  `Active → Blocked → Active`; после каждой операции UI показал корректный статус
  и доступное противоположное действие. Финальное состояние восстановлено в
  `Active`.
- На mobile 390×844 Seller dialog показывает имя, статус `Active` и `Deactivate`;
  сам dialog имеет 382 px viewport width / 380 px content width без horizontal
  overflow. Console errors отсутствуют.
- Локально: `seller-list` и `seller-manager` — **4 tests**; role test подтверждает,
  что Seller не получает administrative UI, а optimistic rollback покрыт component
  test. `npm run build:live` и `git diff --check` проходят с 24 существующими
  lint warnings. Production не изменялся.
