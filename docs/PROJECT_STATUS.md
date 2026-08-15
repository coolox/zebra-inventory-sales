# Статус проекта

Обновлено: 2026-08-15

Текущая фаза: Clothing Pilot operational readiness

## Где мы остановились

- Последняя завершённая задача: [TASK-147](tasks/TASK-147.md).
- Текущий шаг launch plan: **13 из 24**.
- Текущая задача: [TASK-081](tasks/TASK-081.md) — `IN PROGRESS`.
- Owner выбрал Plan B: encrypted daily backups на свой VPS. Для completion нужны
  новый dedicated backup access и GitHub Secrets по
  [BACKUP.md](operations/BACKUP.md); agent не читает их значения.

TASK-145 зафиксировала и проверила кодовый RC
`f838f78680b4fb5a18fd5600f194ec5defd335a6`: GitHub Actions run `31822493717`
зелёный для Frontend и Local Supabase. TASK-079 опубликовала staging Preview из
`main`: `https://zebra-inventory-sales-51z34xyje-cooloxs-projects.vercel.app`.
Для актуального staging Preview Supabase Site URL и callback направлены на
`https://zebra-inventory-sales-fkn819bfk-cooloxs-projects.vercel.app`; production
resources не настраивались и не изменялись. TASK-146 синхронизировала staging history/schema
с полным 29-migration RC set; remote dry-run теперь `upToDate`.

TASK-080 добавила opt-in provider-neutral observability: redacted structured
client/server errors, global fallback и безопасный rate-limited endpoint.
Vercel Preview `https://zebra-inventory-sales-fkn819bfk-cooloxs-projects.vercel.app`
собран Ready в live mode; synthetic event вернул `204` и подтвердил, что raw email
и Bearer value редактируются в runtime log. Preview-only observability включён,
Production не изменялся.

TASK-022 закрыла fresh product-image acceptance: Owner загрузил JPEG/PNG/WebP
в private staging flow, carousel сохранился после reload, unsupported MIME и >8 MiB
отклонены до Storage; ранее подтверждённый cross-store RLS denial остаётся в силе.

TASK-038 закрыла Seller status acceptance: Owner staging UI подтвердил
`Active → Blocked → Active`, а mobile Seller dialog не имеет horizontal overflow.
Тестовый Seller оставлен `Active`; Production не изменялся.

TASK-118 завершена: Owner-approved staging fixture `TASK021-FX-BOUNDARY`
обратимо архивирован с сохранением 4 movements, 2 receipt lines и 2 sale lines.
Migration `20260815120000` canonicalizes server-side receipt colours и
нормализовала 13 проверенных legacy variants с audit records. Staging
reconciliation зелёная: 13/13 colours совпали, active temporary markers = 0;
Production не изменялся.

TASK-147 завершила full staging acceptance. Owner-approved cancellation
безопасно перевела четыре test sales (€640, ранее без captured payments) в
`cancelled` с причиной `TASK-147 staging cleanup`; UI reconciliation теперь
содержит 0 payment mismatch, 0 missing sale movement и 0 negative balance.
Owner также принял 11 historical `manual_correction` review rows как ожидаемые
staging fixtures (D-058); immutable ledger не переписывался. Production не
изменялся.

## Главное решение по порядку работ

Активная разработка функциональности Clothing MVP завершена. До запуска действует
feature freeze: выполняются только release-hardening, staging, operational readiness,
production deployment и pilot tasks из нового [ROADMAP](ROADMAP.md).

AI receipt, Telegram, AI labels и multi-store не входят в критический путь первого
запуска и не реализуются до завершения Clothing Pilot.

## Что уже реализовано

- Zebra Boutique Clothing MVP с ролями Owner/Seller и server-side store boundaries.
- Next.js PWA с English/Turkish, Light/Dark и desktop/tablet/mobile layouts.
- Supabase Auth Magic Link, active membership guard, schema, RLS и audit.
- Catalog, private photos, receipt/inventory ledger, FX и low-stock controls.
- Per-item/total sales, mixed payments, atomic stock, cancellation и exchange.
- Seller invitation/status, inventory adjustment/count, suppliers и archive/restore.
- Sales History, Seller sales summary, Owner reports/reconciliation и CSV/XLSX/PDF.
- Demo/live isolation, persistence, stable routes и no-mock live failure boundary.
- PWA install/standalone flow подтверждён Owner на Android и iOS.

## Повторный test/evidence audit

| Проверка | Фактическое состояние |
|---|---|
| Vitest | 80 files / 187 tests проходят локально на текущем commit |
| Demo build | Проходит |
| Live build | Проходит |
| TypeScript | Проходит как часть production builds |
| Playwright | 19 сценариев × 3 viewport = 57; два последовательных полных прогона проходят 57/57 без retry после фикса animation boundary в TASK-142 |
| Lint | Non-interactive ESLint CLI проходит с 0 errors; 24 существующих warnings остаются видимыми; lint включён в frontend CI job |
| Database | 29 migrations, 14 pgTAP files, 175 SQL assertions |
| Concurrency | Harness существует для sale/sale, sale/adjustment, sale/exchange |
| Current GitHub CI | Run `31822493717` на RC `f838f78680b4fb5a18fd5600f194ec5defd335a6`: Frontend checks и Local Supabase checks зелёные; database job прошёл clean 28 migrations, 13 pgTAP files/169 assertions и concurrency |
| Последний SQL evidence | TASK-143: clean local `supabase:verify` и concurrency прошли; повторены и подтверждены отдельным зелёным GitHub CI run |

## Что проверено на staging ранее

- Sale одного variant разными EUR/USD lines, mixed payments, FX snapshots и rollback.
- Sale total из нескольких товаров и payment reconciliation.
- Receipt Istanbul business-date boundary, idempotency, movements и audit.
- Private product-images bucket/RPC/RLS, cross-store denial и carousel reload.
- Owner invitation и Seller membership status backend.
- Cancellation и exchange atomic flows.
- Magic Link Owner/Seller/unknown/used-link/logout/mobile matrix.
- Current RC Preview: `/` → `/login`, live no-mock boundary, protected session
  middleware и 390 px mobile login smoke подтверждены на
  `https://zebra-inventory-sales-51z34xyje-cooloxs-projects.vercel.app`.
- Staging migration chain совпадает с RC: 29 local/remote IDs, code-first/barcode,
  archive, reporting/reconciliation и Seller summary RPC/RLS проверены; Owner/Seller
  smoke прошёл, а Seller Owner-only reconciliation отклонён.

TASK-147 объединила это evidence с fresh Owner reload и финальной reconciliation;
статус full staging acceptance закрыт.

## Текущие release blockers

1. TASK-081: Plan B выбран и workflow подготовлен. Owner подтвердил endpoint
   вне репозитория и ED25519 fingerprint VPS; routing/host identity зелёные.
   Проверенный read-only SSH login отклонён по authorization, поэтому нужен
   Owner-controlled temporary access. Isolated `zebra-backup` account and
   closed archive directories now exist; its public key was verified and the
   temporary root authorization removed. All twelve backup repository Secrets
   now exist by name, without agent opening their values. Workflow is published
   and run `Staging backup #1` failed before artifact creation because direct
   IPv6 is unreachable from GitHub. A password-preserving runner-side pooler
   transform is now locally verified and awaits a push/re-run for evidence;
   Owner need not replace the DB Secret.
2. Backup/restore, production resources/SMTP и pilot ещё отсутствуют.
3. До production Owner должен выбрать monitoring provider, retention и recipients;
   до этого текущая policy использует Vercel Preview logs.

## Последовательность до запуска

1. TASK-142 — frontend release gate.
2. TASK-143 — database CI/RLS/concurrency gate.
3. TASK-117 — code-first/optional barcode (completed locally; staging application is TASK-146).
4. TASK-144 — remaining EN/TR pass (completed locally).
5. TASK-145 — Release Candidate и merge в `main` (completed).
6. TASK-079 — отдельный staging frontend (completed).
7. TASK-146 — staging migration synchronization (completed).
8. TASK-080 — observability (completed).
9. TASK-022 — fresh product-image smoke (completed).
10. TASK-038 — Seller status UI staging smoke (completed).
11. TASK-118 — staging color audit/approved cleanup (completed).
12. TASK-147 — full staging acceptance (completed).
13. TASK-081 — backups (in progress: VPS/GitHub secret setup).
14. TASK-082 — restore/rollback rehearsal.
15. TASK-148 — security/pilot-capacity smoke.
16. TASK-083 — production projects.
17. TASK-084 — production Auth/SMTP.
18. TASK-085 — production migration rehearsal.
19. TASK-086 — runbooks/training.
20. TASK-149 — Go/No-Go.
21. TASK-150 — production deployment/smoke.
22. TASK-087 — initial clothing inventory.
23. TASK-088 — controlled Clothing Pilot.
24. TASK-151 — pilot exit и production handoff.

## Task accounting

- Всего task-файлов: 151.
- `COMPLETED`: 116.
- `IN PROGRESS`: 1.
- `BLOCKED`: 0.
- `pending`: 34.

Завершённые ID:

- TASK-001—TASK-080;
- TASK-101—TASK-116;
- TASK-123;
- TASK-131—TASK-147; TASK-117.

Незавершённые launch-path tasks перечислены в разделе выше. Post-launch pending tasks:

- TASK-089—TASK-100;
- TASK-119—TASK-122;
- TASK-124—TASK-130.

## Границы и известные риски

- Production не изменялся и реальные данные ещё не загружались.
- Каждый новый Vercel Preview получает уникальный URL. Supabase staging Site URL и
  callback сейчас направлены на Preview `fkn819bfk`; перед следующим Preview-based
  authenticated manual smoke их нужно переключить на выбранный актуальный URL.
- TASK-146 оставила schema-only rollback checkpoint; полноценные managed backup и
  restore rehearsal ещё обязательны в TASK-081/TASK-082.
- TASK-118 завершена: staging fixture model
  `6d3763de-f554-4bcd-92da-6fea5dac74ed` обратимо archived, не deleted; 13
  colour variants канонизированы migration `20260815120000` и reconciled.
  Rollback archive остаётся Owner-only restore; 13 audit records сохраняют
  исходные цвета для обратной транзакции, если потребуется до новых receipts.
- TASK-147 завершена: четыре test sales отменены через Owner audited flow;
  reconciliation не содержит payment mismatch, missing sale movement или
  negative balance. 11 `manual_correction` review records приняты Owner как
  ожидаемые staging fixtures (D-058) и остаются audit evidence.
- TASK-022 завершена; три non-production image fixtures остаются на staging test
  product `YY22` как evidence свежей проверки. Production data не затронуты.
- TASK-038 завершена; staging Seller status восстановлен в `Active` после smoke.
- Кодовый RC `f838f78680b4fb5a18fd5600f194ec5defd335a6` прошёл два GitHub CI jobs;
  merge в `main` зафиксирован в TASK-145.
- `app/page.tsx` остаётся большим, но broad refactor отложен после pilot во избежание регрессий.
- XLSX structural tests существуют; visual open smoke выполняется в live Owner browser.
- Генерируемые test/visual-QA PDF в `tmp/` остаются локальными, игнорируются git и не удаляются автоматически.

## Следующий шаг

Agent pushes the locally verified IPv4 pooler compatibility fix, reruns
`Staging backup` and verifies artifact/checksum/retention/access evidence.
Owner does not replace or disclose the DB Secret.

Агент продолжает только TASK-081, фиксирует backup/retention evidence и обновляет
указатель после её завершения. Он не начинает TASK-082 автоматически.
