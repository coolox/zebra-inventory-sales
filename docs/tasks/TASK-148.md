# TASK-148 — Провести security и pilot-capacity release smoke

Статус: pending

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
