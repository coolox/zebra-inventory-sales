# TASK-210 — FX provenance schema и audited manual override

Статус: COMPLETED

## Цель

Подготовить `exchange_rates` к автоматической загрузке, не меняя финансовые
snapshots: записывать происхождение и freshness курса, сохраняя безопасный Owner
manual fallback.

## Границы

- Одна forward migration для provider, rate basis, source rate date, fetched time,
  status (`automatic` / `carried_forward` / `manual_override`) и carry source.
- Существующий Owner RPC/manual UI явно создаёт `manual_override` и остаётся
  audited; Seller по-прежнему не может писать.
- Read models/Owner UI показывают provenance/staleness, но не запускают fetch,
  cron или retry из браузера.
- Не изменять completed sale, receipt и exchange FX snapshots.

## Критерии готовности

- Existing manual records safely migrate and читаются без потери `eur_rate`.
- Owner manual save сохраняет source/status и audit; Seller write остаётся denied.
- Metadata validation и RLS/RPC coverage проходят на clean local Supabase.
- Demo/live builds проходят.

## Следующая граница

Только после completion этой задачи отдельная TASK может добавить server-side TCMB
fetch, schedule, idempotency/retry, three-business-day carry-forward и alerting.

## Результат

2026-08-31: Добавлена forward migration
`20260831170000_exchange_rate_provenance.sql`. Она маркирует existing manual rows
как `manual` / `owner_manual` / `manual_override`, сохраняет source date/fetched
time, допускает будущий automatic actor без выдуманного Owner и не меняет ни один
sale/receipt/exchange snapshot. Existing Owner RPC теперь явно перезаписывает
manual override metadata и включает provenance в audit details.

`FxRateManager` показывает source, rate date и current/review state для каждой
загруженной ставки; Seller остаётся read-only по существующей RLS/RPC boundary.

Проверки: clean local migration и
`038_exchange_rate_provenance_test.sql` (10/10 pgTAP); targeted Vitest (9/9);
`npm run build:demo`, `npm run build:live`, `git diff --check` прошли. Local
Supabase CLI reset имеет нестабильный Realtime startup, поэтому чистая schema была
подтверждена через local `supabase start` и migrations; production не затрагивался.
