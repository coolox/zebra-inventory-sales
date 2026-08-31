# TASK-211 — Server-side TCMB FX sync и безопасный carry-forward

Статус: COMPLETED

## Цель

Автоматически получать дневные EUR/USD/TRY TCMB `Döviz Satış` rates только на
server-side, писать их идемпотентно в provenance schema и безопасно переносить
последний approved rate не более чем на три Istanbul business days.

## Границы

- Supabase Edge Function или другой server-only job использует TASK-209 parser.
- Fetch после публикации TCMB; bounded retry без browser fetch и без provider
  credentials в repository.
- `automatic` и `carried_forward` rows получают provider/source date/fetched time;
  manual override не перезаписывается без явной Owner action.
- Никакого скрытого provider fallback. Observable error/stale signal обязателен.

## Критерии готовности

- Job идемпотентен при retry/concurrent run и не создаёт audit noise.
- Malformed/future/implausible source не меняет approved rate.
- Weekend/holiday carry-forward лимитирован тремя Istanbul business days и
  сохраняет исходную source date.
- Historical financial snapshots неизменяемы; RLS/Seller boundary сохраняется.
- Unit/integration tests, database checks и demo/live builds проходят.

## Результат

2026-09-01: Добавлены защищённая server-only Edge Function
`sync-exchange-rates`, GitHub Actions schedule после публикации TCMB и
`exchange_rate_sync_runs` для Owner-visible success/carry/failure state.
Function использует strict TASK-209 parser, не допускает future/malformed source,
пишет через service-only RPC, не заменяет `manual_override`, serializes same-day
runs advisory lock и не делает rate writes на идентичном retry. При transport
failure разрешён только TCMB carry-forward из complete EUR/USD/TRY set не старше
трёх business days; ECB/other fallback отсутствует.

Добавлены `FX_RATES.md`, migration
`20260831180000_automatic_exchange_rate_sync.sql`, pgTAP coverage и Owner warning
в Daily exchange rates. Проверки: FX Vitest 11/11; pgTAP TASK-210 10/10 и
TASK-211 9/9 на clean local migrations; local Edge runtime загрузил function,
unauthenticated/config-less POST остановился до provider/database write; demo/live
builds и `git diff --check` прошли. Production deploy, URL и secrets не создавались.
