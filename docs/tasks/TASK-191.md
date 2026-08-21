# TASK-191 — Восстановить зелёные release gates и собрать consolidated remediation commit

Статус: COMPLETED

Приоритет: P0 — release recovery перед physical acceptance TASK-165.

Источник: Owner-requested independent recovery audit, 2026-08-22.

## Цель

Свести незакоммиченный remediation set TASK-152—TASK-190 в один проверенный,
воспроизводимый commit перед публикацией общего staging Preview и physical
Owner/Seller walkthrough TASK-165.

## Границы

- Исправить только regressions, обнаруженные полным release-gate audit:
  XLSX/PDF export route mocks, mobile/tablet Playwright selector и возможные
  fresh-database failures.
- Выполнить полный frontend и local Supabase gate на текущем consolidated tree.
- Синхронизировать task accounting, единственный current pointer, roadmap,
  changelog и agent instructions; удалить устаревшие команды, которые могут
  направить следующий чат на уже завершённую задачу.
- Проверить staged content на отсутствие secrets и случайных build/test artifacts.
- Не публиковать staging/production, не менять Auth URLs, production database,
  identities или реальные данные.
- Не начинать TASK-165: она становится единственным следующим шагом только после
  зелёного commit.

## Критерии готовности

- Full Vitest, lint, demo/live builds и full Playwright проходят.
- Fresh local Supabase reset, все pgTAP files, concurrency и security smoke проходят.
- `PROJECT_STATUS.md`, `ROADMAP.md`, `CHANGELOG.md`, AGENTS instructions и task
  statuses не содержат противоречивого current/next pointer.
- TASK-188 evidence отражает исправленные export route regressions; TASK-165 честно
  остаётся physical/staging acceptance gate.
- Consolidated remediation set сохранён одним commit без secrets, `.env.local`,
  build outputs или runtime test artifacts.

## Проверки

- `npm test -- --run`
- `npm run lint`
- `npm run build:demo`
- `npm run build:live`
- `npm run test:e2e`
- fresh `npm run supabase:reset`
- `npm run supabase:test`
- `npm run supabase:concurrency`
- `npm run supabase:security-smoke`
- `git diff --check`
- staged secret/artifact review

## Результат

- Cash/Kasa XLSX/PDF API route mocks теперь возвращают обязательный третий
  `owner_cash_report` result; XLSX route test также проверяет Cash worksheet.
- Mobile/tablet smoke использует точный navigation locator и не конфликтует с
  повторяющимся Zebra Boutique brand text.
- Fresh reset обнаружил, что migration TASK-175 переопределила receipt RPC без
  TASK-118 canonical colour conversion. Forward migration
  `20260822120000_preserve_receipt_color_canonicalization.sql` объединяет обе
  data boundaries: existing model identity остаётся locked, а Turkish/English
  colour aliases не создают duplicate variants.
- `PROJECT_STATUS.md` сокращён до единственного ясного pointer/evidence handoff.
  `README`, `QUESTIONS`, `WORKFLOW`, `AGENTS`, `ROADMAP` и completed TASK-190 больше
  не называют historical commands или `CURRENT_STATE.md` текущим маршрутизатором.
- TASK-084 переведена из misleading `IN PROGRESS` в `WAITING`; TASK-165 является
  единственной следующей `pending`/`NEXT` задачей.

## Evidence — 2026-08-22

- `npm test -- --run` — 90 files / 243 tests passed.
- `npm run lint` — 0 errors; 26 non-blocking warnings.
- `npm run build:demo` — passed.
- `npm run build:live` — passed.
- `npm run test:e2e` — 78/78 passed without retry.
- Fresh `npm run supabase:reset` — 37 migrations applied.
- `npm run supabase:test` — 20 files / 214 assertions passed.
- `npm run supabase:concurrency` — sale/sale, sale/adjustment, sale/exchange and
  repeated clean run passed.
- `npm run supabase:security-smoke` — 27 checks passed; five-user burst median
  179 ms, slowest 184 ms under the 5 s threshold.
- `git diff --check` — passed before staging.
- Staging/Production/Auth configuration and real data were not changed.
