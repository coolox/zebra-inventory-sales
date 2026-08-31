# TASK-212 — Staging activation и Owner acceptance автоматических FX

Статус: PAUSED

## Цель

Опубликовать проверенную Edge Function сначала в staging, безопасно создать только
в secret stores `FX_SYNC_SECRET` / `FX_SYNC_URL`, включить schedule и получить
Owner evidence для automatic, carried-forward и failed states.

## Границы

- Нужна явная команда Owner на staging publication и secret setup; значения
  секретов никогда не попадают в repository или chat.
- Проверить один protected manual invocation, scheduled retry, Owner visibility,
  Seller no-write/no-sync-health boundary и non-overwrite manual override.
- Production activation — только после отдельного Owner approval и staging result.

## Критерии готовности

- Staging function/schedule работают с TCMB и evidence зафиксировано без secrets.
- Нормальный день, safe carry и failure не меняют historical snapshots.
- Owner принимает staging behavior либо фиксирует отдельный defect task.

## Текущее evidence / граница

2026-09-01: staging project `zebra-retail-staging` healthy и выбран корректно;
production link восстановлен после проверки. Read-only `db push --dry-run` показал,
что staging отстаёт не только от двух FX migrations, но также от восьми ранних
completed migrations (`20260820120000`—`20260822120000`). Эти migrations выходят
за scope TASK-212 и могут менять staging catalog/reporting data, поэтому они не
применялись. Edge Function, GitHub secrets и schedule тоже не публиковались: без
FX schema она не может безопасно работать.

Нужно явное Owner решение: разрешить применить весь dry-run набор к staging после
schema backup/review либо сначала выделить отдельный staging migration-drift task.

2026-09-01: Owner разрешил весь reviewed dry-run set. Все 10 migrations успешно
применены только на `zebra-retail-staging`; remote history совпадает с local через
`20260831180000`. `sync-exchange-rates` опубликована только в staging. Staging
Supabase/GitHub Actions secrets созданы и ротированы без записи значения в
repository; GitHub workflow commit `58540c5` отправлен в `main`.

Protected manual call вернул HTTP 200: Istanbul business date `2026-09-01`, source
date `2026-08-31`, `carried_forward`, три обновлённые EUR/USD/TRY ставки. Это
ожидаемо до дневней публикации TCMB и подтверждает limit/provenance path. Manual
GitHub Actions workflow run `33445739913` завершился `success`. Production
Supabase не менялся; local CLI link возвращён на production project.

Остаётся Owner visual acceptance: в staging `Daily exchange rates` проверить
TCMB/carry warning/source date и Seller no-write/no-sync-health state. После
явного Owner acceptance задача закрывается; production activation потребует
отдельной команды.

2026-09-01: Owner поставил staging visual acceptance на паузу до общего
release-readiness audit всех remediation fixes и next-version features. Не
публиковать frontend build до результата TASK-213.
