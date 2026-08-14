# TASK-146 — Синхронизировать Release Candidate migrations со staging

Статус: COMPLETED

## Цель

Доказать, что staging schema, RPC/RLS и live frontend соответствуют точному RC commit до manual acceptance.

## Зависимости

TASK-079, TASK-117, TASK-145.

## Критерии готовности

- Выполнен read-only inventory уже применённых staging migrations.
- Недостающие migrations применены строго в порядке после backup/rollback checkpoint.
- В staging присутствуют Seller summary, reporting, archive/barcode policy и остальные RC RPC/RLS версии.
- Live mode не использует mock fallback.
- Migration IDs и RC commit записаны без secrets/concrete credentials.

## Тесты

- Staging schema/migration diff.
- Owner/Seller RLS and RPC smoke.
- Sale/receipt/reconciliation sanity check.
- Live frontend health/auth smoke.

## Evidence выполнения

- До изменения создан schema-only rollback checkpoint staging `public` без данных:
  SHA-256 `606fac0b16282aa1dec5b910f88aa148659ce1600a9cd4addcd7ca456358c3ac`
  (107120 bytes). Полный backup/restore остаётся отдельными TASK-081/TASK-082.
- Read-only inventory обнаружил, что в `schema_migrations` были только 3 поздних ID,
  хотя schema уже содержала объекты 17 исторических migrations. После проверки
  существующих table/RPC/guards их IDs были безопасно восстановлены в history через
  `migration repair --status applied`; данные, RLS и объекты при repair не менялись.
- Dry-run после repair оставил ровно восемь отсутствующих RC migrations, применённых
  в порядке: `20260811090000`, `20260811100000`, `20260813030000`—`20260813060000`,
  `20260814010000`, `20260814110000`.
- Финальный `migration list --linked` содержит все 28 local/remote IDs, а
  `db push --dry-run --include-all` возвращает `upToDate: true`. Это соответствует
  кодовому RC `f838f78680b4fb5a18fd5600f194ec5defd335a6`.
- Подтверждены archive/barcode/code-first guards, reporting, inventory,
  reconciliation и Seller summary RPC. Owner smoke получил reporting/inventory/
  reconciliation; Seller — reporting/inventory и 7 summary periods. Seller вызов
  Owner-only reconciliation был отклонён с `Owner access is required`.
- Receipt, sale и payment-sale RPC присутствуют; staging sanity использует только
  агрегированные counts. Live staging `/` перенаправляет на `/login`, а session
  endpoint остаётся защищён middleware; mock fallback не использован.
- Изменён только `zebra-retail-staging`; production database и resources не трогались.
