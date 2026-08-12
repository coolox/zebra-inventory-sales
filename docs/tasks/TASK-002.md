# TASK-002 — Применить исправление mixed-currency sale на staging

Статус: COMPLETED

## Цель

Применить миграцию TASK-001 в staging и подтвердить реальный пользовательский сценарий без изменения production.

## Предполагаемые файлы

- `supabase/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/tasks/TASK-002.md`

## Зависимости

TASK-001.

## Критерии готовности

- Миграция применена в staging один раз.
- Продажа одного variant строками EUR и USD успешно сохраняется.
- Остаток, sale lines, payment и audit log согласованы.

## Тесты

- Ручной staging smoke-test 100 EUR + 100 USD.
- Проверка stock delta и записей `sales`, `sale_lines`, `sale_payments`, `audit_logs`.
- Повтор с недостаточным stock подтверждает rollback.

## Прогресс

- 2026-08-09: migrations `20260809153000_sale_line_identity.sql` и `20260809160000_native_currency_payments.sql` применены к `zebra-retail-staging` через точечный CLI push.
- История staging подтверждает обе версии. Пользовательский smoke-test и rollback ещё ожидают авторизованную staging-сессию и тестовый вариант с остатком.
- 2026-08-10: staging sale `2385f606-4042-41ba-9ff0-82b120a99391` подтверждает один variant двумя разными lines: 100 EUR и 100 USD; EUR total 183.33, две payment/FX snapshots, два inventory movements и `sale.confirmed` audit.
- 2026-08-10: отрицательный вызов с количеством 2 при остатке 1 завершился `rollback_verified`: sale с тестовым idempotency key не создана, остаток не изменился.
