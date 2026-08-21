# TASK-148 — Провести security и pilot-capacity release smoke

Статус: COMPLETED

## Цель

Подтвердить, что staging RC выдерживает ожидаемый Clothing Pilot и не обходит server-side boundaries.

## Зависимости

TASK-043, TASK-077, TASK-147.

## Критерии готовности

- Anonymous, unknown, blocked и cross-store requests получают безопасный отказ.
- Прямые table writes и Owner-only RPC недоступны Seller.
- Rate limits срабатывают для auth/session/Seller administration без блокировки нормального pilot flow.
- Sale/receipt/exchange/cancellation сохраняют атомарность под ожидаемой параллельностью пяти pilot users.
- Error responses и monitoring events не содержат secrets или лишнюю PII.
- Зафиксированы измерения и допустимый pilot threshold; задача не является бессмысленным high-scale benchmark.

## Тесты

- Existing RLS/concurrency regression suite.
- Staging authorization probes.
- Controlled five-user operation burst и post-run reconciliation.
- Monitoring/redaction review.

## Результат — 2026-08-16

TASK-148 завершена без release blockers.

- Новый `supabase:security-smoke` выполняет 20 real-HTTP PostgREST probes against
  a clean local RC schema using only well-known local development keys. Anonymous,
  unknown, blocked, forged-token и cross-store callers не получают данные; Seller
  не может писать ledger/sales/membership напрямую или вызывать Owner-only RPC;
  active Seller и Owner сохраняют разрешённый flow.
- Controlled five-user burst подтвердил пять независимых atomic sales. Последний
  прогон: median **317 ms**, slowest **323 ms**; pilot threshold — **< 5000 ms**.
  Idempotency replay не создал sales, payment totals/movements совпали, negative
  inventory отсутствует. Это pilot-sized smoke, не high-scale benchmark.
- Existing clean `supabase:verify` (14 pgTAP files, 175 assertions) и concurrency
  harness подтвердили receipt/sale/cancellation/exchange contracts, включая
  sale/sale, sale/adjustment и sale/exchange conflicts.
- Rate limits проверены на реальных session, Seller invite и Seller status handlers:
  normal-flow attempts получают обычный ответ до policy limit, следующий получает
  `429` и `Retry-After`. Monitoring/redaction unit checks прошли без raw email,
  Bearer token или other sensitive context in captured output.
- `supabase:security-smoke` добавлен в package scripts и Local Supabase CI job после
  отдельного clean reset. Staging Preview Owner smoke загрузил protected live
  workspace, scoped inventory, reports и reconciliation без записи данных.

Проверки: `npm test` — 81 files / 190 tests; `npm run supabase:verify` — 14 files /
175 assertions; `npm run supabase:concurrency` — 4/4 PASS; `npm run
supabase:security-smoke` — 26/26 checks PASS; `npm run lint` — 0 errors, 24 existing
warnings; demo и live production builds проходят.
