# TASK-099 — Добавить Transfer UI

Статус: pending

## Цель

Дать Owner создать и подтвердить межмагазинное перемещение с variant quantities.

## Предполагаемые файлы

- `features/transfers/**`
- `app/(dashboard)/transfers/page.tsx`

## Зависимости

TASK-052, TASK-098.

## Критерии готовности

- UI показывает source/destination и доступный stock.
- Confirmation и errors однозначны.
- После success оба store snapshots обновляются.

## Тесты

- Component validation/permission tests.
- Staging multi-store transfer smoke.
- Mobile/desktop browser test.

