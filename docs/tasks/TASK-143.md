# TASK-143 — Восстановить зелёный database CI на текущем commit

Статус: IN PROGRESS

## Цель

Воспроизвести и устранить падение `Local Supabase checks` текущего GitHub CI, не ослабляя RLS или assertions.

## Исходное evidence

- CI run `31785382973`, commit `b9d2fc6`: Frontend checks успешны.
- Database job падает на `Run RLS and database integration tests`.
- Concurrency steps пропущены из-за предыдущего failure.
- Последний документированный локальный `supabase:verify` pass относится к TASK-140; текущий commit локально ещё не перепроверен.

## Зависимости

TASK-140, TASK-142.

## Критерии готовности

- Точная failing assertion или environment difference зафиксирована.
- Исправлена причина, а не отключён/смягчён тест.
- Все 27 migrations применяются на чистой локальной базе.
- 13 pgTAP файлов / 162 SQL assertions проходят.
- Concurrency harness sale/sale, sale/adjustment и sale/exchange проходит после нового clean reset.
- GitHub CI на итоговом commit имеет зелёные Frontend и Local Supabase jobs.

## Тесты

- `npm run supabase:verify`.
- Clean reset и `npm run supabase:concurrency`.
- Полный GitHub Actions run без production/staging secrets.

## Прогресс и текущий блокер

- Точный failure из GitHub CI run `31785382973` установлен: файл
  `030_seller_sales_summary_test.sql` пытался создать sale со статусом
  `cancelled` без обязательных `cancelled_at`, `cancelled_by` и
  `cancellation_reason`. Корректный constraint
  `sales_cancellation_snapshot_check` прерывал файл до pgTAP assertions.
- Fixture исправлен: confirmed sales явно сохраняют пустой cancellation snapshot,
  cancelled fixture содержит полный snapshot. RLS, constraint и assertions не
  ослаблялись.
- После согласованного перезапуска Docker Desktop локальный `npm run supabase:verify`
  прошёл: clean reset применил 27 migrations, а 13 pgTAP files/162 assertions
  завершились `PASS`.
- После второго clean reset прошёл `npm run supabase:concurrency`: sale/sale,
  sale/adjustment и sale/exchange отклонили по одной конфликтующей операции без
  отрицательных ledger balances.
- До `COMPLETED` остаётся новый GitHub CI run на commit с этим фиксом. Для него
  требуется отдельное разрешение Owner на commit и push текущего worktree в
  `origin/review/task-060-077`; staging и production не затрагиваются.
