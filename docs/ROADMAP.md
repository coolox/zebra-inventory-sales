# План запуска Zebra Retail — Clothing Pilot

Обновлено: 2026-08-22

Текущий этап: Owner visual intake pause before final staging acceptance

Текущий шаг: Owner visual intake (`PAUSED`) — implementation не начинать до
явного закрытия intake

Команда для продолжения: ожидать явную команду Owner после завершения intake

Исторический pre-remediation RC: `f838f78680b4fb5a18fd5600f194ec5defd335a6`;
GitHub Actions run `31822493717` прошёл Frontend и Local Supabase gates. Текущий
candidate — consolidated TASK-191 commit; он становится новым RC только после
TASK-165 staging/device acceptance и TASK-149 Go/No-Go.

Этот файл полностью заменяет старый поэтапный roadmap. История выполненной работы
сохранена в `docs/tasks/TASK-NNN.md`, git и `CHANGELOG.md`; завершённые функции не
реализуются повторно.

## 1. Цель этого плана

Довести существующий Clothing MVP до работающего production-пилота Zebra Boutique:

1. стабилизировать текущий код и проверки;
2. получить воспроизводимый Release Candidate;
3. проверить его в отдельном staging;
4. подготовить monitoring, backup и rollback;
5. развернуть production;
6. загрузить начальный clothing inventory;
7. провести контролируемый пилот и зафиксировать его успешное завершение.

До завершения пилота действует feature freeze. Новая функциональность не добавляется,
кроме исправлений release-blockers и уже согласованных launch tasks.

## 2. Scope первого запуска

В Clothing Pilot входят:

- один магазин Zebra Boutique;
- роли Owner и Seller с server-side store boundary;
- Magic Link authentication;
- catalog, private product photos, receipts и inventory ledger;
- per-item/total sales, mixed payments и Owner FX rates;
- cancellation, exchange, inventory adjustment и count;
- Seller management, audit log и Seller sales summary;
- Owner reports, reconciliation и CSV/XLSX/PDF exports;
- English/Turkish, Light/Dark, desktop/mobile и installable PWA.

Не блокируют первый запуск и остаются post-launch backlog:

- TASK-089—TASK-093 и TASK-119—TASK-122 — AI receipt;
- TASK-094—TASK-096 — общий API и Telegram;
- TASK-097—TASK-100 — дополнительные магазины и transfers;
- TASK-124—TASK-130 — AI sale-label flow.

`app/page.tsx` остаётся большим, но его дополнительный рефакторинг до пилота запрещён,
если он не нужен для исправления конкретного дефекта. Это снижает риск регрессий.

## 3. Повторный аудит перед новым планом

### Уже реализовано и имеет evidence

- 161 task-файл имеет статус `COMPLETED` / legacy `completed`.
- На consolidated remediation tree проходят 90 Vitest files / 243 tests.
- Demo и live production builds проходят TypeScript/build validation.
- Full Playwright gate проходит 78/78 desktop/tablet/mobile checks без retry.
- Non-interactive ESLint CLI проходит с 0 errors и включён в frontend CI job;
  26 non-blocking warnings остаются видимыми.
- Fresh local reset применяет 37 migrations; 20 pgTAP files / 214 assertions проходят.
- Есть concurrency harness для sale/sale, sale/adjustment и sale/exchange conflicts.
- Основные sale, receipt, image, auth, Seller status, cancellation и exchange flows уже
  имеют staging evidence; PWA подтверждена на Android/iOS.
- GitHub Actions выполняет frontend и database jobs без staging/production secrets.

### Что перепроверено и ещё не является зелёным release gate

- TASK-118 закрыта: Owner-approved fixture archived с сохранением history;
  server-side receipt canonicalization и 13 audited colour updates применены
  на staging, rollback path и reconciliation записаны.
- Empty production Supabase/Vercel/schema, SMTP configuration и backup/restore
  preparation существуют; application deploy, monitoring acceptance, real data и
  pilot ещё не выполнены.

## 4. Единая последовательность задач до запуска

Порядок ниже обязателен. Следующая задача не начинается автоматически: после каждого
task обновляются его файл, `PROJECT_STATUS.md` и `CHANGELOG.md`.

Статусы launch plan:

- `DONE` — задача завершена и evidence записано;
- `NEXT` — единственная задача, которую можно начать по команде Owner;
- `IN PROGRESS` — текущая задача уже выполняется; новый чат продолжает её;
- `WAITING` — ожидает предыдущие шаги;
- `PARTIAL` — часть уже сделана, но launch criteria ещё не закрыты;
- `BLOCKED` — продолжение невозможно без решения или внешнего изменения.
- `PAUSED` — Owner временно собирает feedback; implementation не авторизована.

| Шаг | Статус | Task | Результат / gate |
|---:|---|---|---|
| 1 | DONE | TASK-142 | Рабочий non-interactive lint, стабильный Playwright animation boundary, чистый frontend release gate |
| 2 | DONE | TASK-143 | Точная причина CI failure исправлена; 27 migrations, 162 SQL assertions и concurrency зелёные локально и в GitHub CI |
| 3 | DONE | TASK-117 | Code-first UUID identity, optional model/variant barcode и QR payload guard готовы; staging application подтверждено завершённой TASK-146 |
| 4 | DONE | TASK-144 | Owner Supplier/Count controls снова доступны, FX/Inventory EN/TR gaps закрыты; desktop/mobile Owner/Seller smoke зелёный локально |
| 5 | DONE | TASK-145 | Code RC `f838f78680b4fb5a18fd5600f194ec5defd335a6` влит в `main`; GitHub CI run `31822493717` зелёный |
| 6 | DONE | TASK-079 | RC Preview `zebra-inventory-sales-51z34xyje-cooloxs-projects.vercel.app` готов; live-only env, callback и desktop/mobile smoke подтверждены |
| 7 | DONE | TASK-146 | 28 RC migrations совпадают local/staging; schema checkpoint, Owner/Seller RPC/RLS и live no-mock smoke зелёные |
| 8 | DONE | TASK-080 | Redacted client/server observability, critical-operation policy и Preview runtime-log synthetic evidence готовы; production provider choice остаётся до production gate |
| 9 | DONE | TASK-022 | Owner fresh JPEG/PNG/WebP upload, carousel reload, MIME/oversize rejection и prior private Storage/RLS denial evidence подтверждены на staging |
| 10 | DONE | TASK-038 | Owner staging UI подтвердил Active → Blocked → Active с восстановлением доступа; mobile Seller dialog без horizontal overflow |
| 11 | DONE | TASK-118 | Fixture archived через Owner flow, 13 variants canonicalized и audited; staging reconciliation зелёная |
| 12 | DONE | TASK-147 | Full Owner/Seller staging evidence consolidated; four approved test sales cancelled through Owner audit flow, reconciliation has no P0/P1 error |
| 13 | DONE | TASK-081 | Encrypted daily DB + `product-images` archive создан, перенесён на Owner VPS, checksum сверена и artifact расшифрован настоящим `age` key |
| 14 | DONE | TASK-082 | Изолированный restore rehearsal: 43/43 tables и 16/16 images reconciled; Owner/Seller RPC smoke и rollback plan с принятым RPO 24 часа зафиксированы |
| 15 | DONE | TASK-148 | Local HTTP RLS/authorization, rate-limit, five-user burst (323 ms slowest <5s), idempotency/reconciliation и staging Preview Owner smoke зелёные; smoke включён в CI |
| 16 | DONE | TASK-083 | Empty production Supabase (`eu-central-1`, Data API on, auto-exposure off, automatic RLS on) и Vercel project без Git/deployment созданы отдельно от staging |
| 17 | PARTIAL | TASK-084 | SMTP, exact redirect boundary и EN/TR template configured; delivery matrix выполняется после controlled identity/callback до TASK-150 |
| 18 | DONE | TASK-085 | Empty production schema applied through recorded 29-migration CLI chain; local RLS/RPC/recovery evidence зелёное |
| 19 | DONE | TASK-086 | Bilingual runbooks prepared; Owner walkthrough завершён, feedback сохранён в TASK-152—TASK-163 |
| 19A | DONE | TASK-156 | Multi-item sale отображается одним ticket с одним total; Owner подтвердил исправление на staging |
| 19B | DONE | TASK-152 | Постоянная Owner-кнопка архива, EN/TR empty/error states и прямой restore прошли 60/60 desktop/tablet/mobile; deployment ждёт общего remediation Preview |
| 19C | DONE | TASK-153 | Owner-only Reconciliation открывается по запросу, скрывается, обновляется и полностью локализована; 63/63 browser regression зелёный |
| 19D | DONE | TASK-154 | Low stock стал компактным on-demand EN/TR view с loading/empty/error states; 66/66 browser regression зелёный |
| 19E | DONE | TASK-155 | Preview server-only credential добавлен Owner напрямую; safe route diagnostics и локальные regression gates зелёные; invitation acceptance войдёт в общий remediation Preview |
| 19F | DONE | TASK-157 | Tap закрепляет точную EUR сумму, explicit close, zero/hover/focus и EN/TR labels; 3/3 viewport browser check зелёный |
| 19G | DONE | TASK-158 | Movement History открывается в центрированном safe-area mobile dialog; короткая история компактна, длинная scrollable, focus/scroll lock сохранены |
| 19H | DONE | TASK-159 | Audit Log сбрасывает page при любом filter и не позволяет перейти за empty/last/loading/error boundaries |
| 19I | DONE | TASK-160 | Adjust Stock требует явный size, сбрасывает draft delta при смене и показывает variant-specific confirmation summary |
| 19J | DONE | TASK-161 | ReportsDashboard полностью локализован EN/TR, включая exports, KPI, dimensions, table и dynamic fallbacks |
| 19K | DONE | TASK-162 | Owner-only audited Product code correction: UUID/ledger/photos/barcode preserved; EN/TR edit states covered locally |
| 19L | DONE | TASK-163 | Receive Flow Product code сохраняется при blur/Done/IME; control/invisible suffix blocked with explicit EN/TR validation |
| 19M | DONE | TASK-164 | Adjust Stock modal overlay fixed; Audit/Seller stale selectors scoped to header; Playwright 75/75 зелёный |
| 19N | DONE | TASK-166 | Фирменный знак Zebra Boutique заменил `ZB` в navigation и Android/iOS PWA assets; build и manifest checks зелёные |
| 19O | WAITING | TASK-165 | Publish the post-intake reviewed commit to staging and run shared Owner/Seller physical iPhone/Redmi acceptance; Production untouched |
| 19P | DONE | TASK-167 | Preview block caused only by invalid temporary Git author; no-Git snapshot built live and Ready without settings mutation |
| 19Q | DONE | TASK-168 | Login использует Zebra Boutique mark; targeted test, demo/live build и Ready Preview safe smoke зелёные |
| 19R | DONE | TASK-169 | Staging Auth Site URL and exact callback point to consolidated Preview; Owner/Seller Magic Link reaches workspace and logout returns to login |
| 19S | DONE | TASK-170 | Late Android input after keyboard dismiss is ignored once a controlled field loses focus; Product code, sale price, total price and mixed-payment amount are protected; targeted tests and build passed |
| 19T | DONE | TASK-171 | Live workspace loads persisted exchanges/payment snapshots after reload; History exposes top-up, 16 UI/model + 37 pgTAP green; physical €100→€170→€70 in TASK-165 |
| 19U | DONE | TASK-172 | Light-theme Sales Trend uses transparent hit areas, light lavender grid and soft purple hover; 6 targeted tests and demo build passed |
| 19V | DONE | TASK-173 | Light-theme Receive Flow add-colour action has distinct enabled/disabled and light-theme secondary states; 13 targeted tests passed |
| 19W | DONE | TASK-174 | Reconciliation distinguishes EUR payments from stock quantities and explains source/meaning/action EN/TR; Vitest 5/5, demo/live builds green |
| 19X | DONE | TASK-175 | Existing-model identity and supplier are locked in UI and ignored server-side; UI 16/16, clean pgTAP 5/5, demo/live builds green; Redmi recheck in TASK-165 |
| 19Y | DONE | TASK-176 | Product code success now requires exact server-confirmed value; Owner/RLS/audit pgTAP 11/11 and demo/live builds green; Redmi recheck in TASK-165 |
| 19Z | DONE | TASK-177 | Owner-only audited model update объединяет name/gender/threshold/current purchase cost; inline threshold removed, targeted UI/pgTAP/build passed |
| 19AA | DONE | TASK-178 | Owner-only confirmed private photo removal, retry-safe Storage cleanup and carousel swipe; UI/pgTAP/build passed |
| 19AB | DONE | TASK-179 | Istanbul calendar helper replaces elapsed-24-hour Sales History offset; 15 Vitest + 20/20 pgTAP + demo/live builds green; physical recheck in TASK-165 |
| 19AC | DONE | TASK-180 | Owner подтвердил штатную Safari Home Screen installation, launch installed PWA и корректную работу; Magic Link acceptance подтверждён в TASK-169 |
| 19AD | DONE | TASK-181 | Professional EN/TR Arslan Ram attribution is in the responsive workspace footer; no external link or operational-flow impact |
| 19AE | DONE | TASK-182 | Owner reporting gets display name→approved email fallback; Seller caller cannot receive actor email, and genuine unknown is explained; Vitest 5/5, pgTAP 3/3, demo/live builds green |
| 19AF | DONE | TASK-183 | Seller Summary now rejects late stale responses and shows successful-update time; Store/My scope remains explicit, physical two-session comparison moves to TASK-165 |
| 19AG | DONE | TASK-184 | Exchange now uses Product code/barcode → model → colour → available size; atomic/payment flow unchanged, physical check is in TASK-165 |
| 19AH | DONE | TASK-185 | Turkish greeting says `bol satışlar`; English heading is `Hello {name},` while supporting line retains Zebra Boutique good-sales copy |
| 19AI | DONE | TASK-186 | Sale Details keeps a private sale-time image snapshot with thumbnail, fallback and fullscreen preview; 8 Sales History tests and build passed |
| 19AJ | DONE | TASK-187 | Turkish Audit Log maps filters/actions/entities and safe metadata to business copy; raw IDs remain on-demand and sensitive details stay hidden; tests 7/7, demo/live builds green |
| 19AK | DONE | TASK-188 | Owner-only Cash/Kasa aggregates captured ledger payments by method × currency; CSV/print/XLSX/PDF include a clearly labelled non-physical-cash section; targeted tests and build passed |
| 19AL | DONE | TASK-189 | Responsive full-value KPI implementation and automated coverage complete; Redmi 14 recheck explicitly moves to TASK-165 |
| 19AM | DONE | TASK-190 | Owner bug intake closed; TASK-170—TASK-189 order, evidence locations, staging and publication gates fixed |
| 19AN | DONE | TASK-191 | Full frontend/database gates restored, handoff sources synchronized and consolidated remediation commit created before TASK-165 |
| 19AO | DONE | TASK-192 | Turkish greeting heading now ends after the name; demo build passed |
| 19AP | DONE | TASK-193 | Light-theme secondary actions have readable enabled/disabled/hover contrast; targeted tests and demo build passed |
| 19AQ | DONE | TASK-194 | Active Audit Log category chip has readable light-theme contrast; 6 targeted tests and demo build passed |
| 19AR | DONE | TASK-195 | Sale Flow duplicate/out-of-stock warning has readable light-theme amber contrast; 11 targeted tests and demo build passed |
| 19AS | DONE | TASK-196 | Photo-first local demo fixture restores thumbnail/fullscreen; 12 targeted tests and demo build passed |
| 19AT | DONE | TASK-197 | Sell-first hierarchy and one Owner Product Edit entry keep separate audited detail/code saves; 15 targeted tests and demo build passed |
| 19AU | NEXT | TASK-198 | Owner can visibly remove a mistaken saved product photo in demo and live without weakening TASK-178 safeguards |
| 20 | BLOCKED | TASK-149 | NO-GO: нужны TASK-084 Auth acceptance, immutable release tag, shared staging/device evidence, monitoring/roles/window и explicit Owner GO |
| 21 | WAITING | TASK-150 | Тот же Release Candidate развёрнут в production; auth/data/transaction smoke зелёный |
| 22 | WAITING | TASK-087 | Реальный clothing catalog/stock загружен и физически reconciled |
| 23 | WAITING | TASK-088 | Zebra Boutique работает в контролируемом pilot с ежедневной сверкой |
| 24 | WAITING | TASK-151 | Pilot exit подписан; production передан в обычную эксплуатацию |

### Как работать с планом в любом новом чате

1. Owner копирует из `PROJECT_STATUS.md` строку `Команда для продолжения` и пишет,
   например: `Выполни TASK-084`.
2. Агент читает `AGENTS.md` → `PROJECT_STATUS.md` → только выбранный `TASK-NNN.md`.
3. Выбранный `TASK-NNN` — единственная следующая задача; агент не начинает другой шаг.
4. После выполнения агент записывает проверки в `TASK-NNN` и меняет статус на `COMPLETED`.
5. В этой таблице завершённый `TASK-NNN` становится `DONE`, следующая задача —
   единственным `NEXT`.
6. В `PROJECT_STATUS.md` меняются последняя завершённая TASK, текущий шаг и команда
   следующей `TASK-NNN`.
7. Финальный ответ заканчивается результатом `TASK-NNN` и приглашением дать точную
   следующую команду. Агент не начинает следующую TASK самостоятельно.

Если задача заблокирована, она остаётся текущей, получает статус `BLOCKED` с причиной,
а указатель не переходит дальше без решения Owner.

### Текущая release sequence

1. `NEXT` TASK-165 — exact consolidated staging Preview и physical Owner/Seller
   iPhone/Redmi acceptance.
2. `BLOCKED` TASK-149 — renewed Go/No-Go, immutable tag, monitoring/roles/window,
   rollback confirmation и explicit Owner `GO`.
3. TASK-150 — отдельная authorized Production publication.
4. TASK-087 → TASK-088 → TASK-151 — real inventory, controlled pilot, pilot exit.

Только pointer в начале `PROJECT_STATUS.md` разрешает работу; этот sequence не
разрешает автоматически начинать следующий шаг.

## 5. Exit criteria по фазам

### Phase A — Release Candidate: TASK-142—TASK-145

- lint, 173+ frontend tests, demo/live builds и 57 browser checks стабильны;
- clean database migration, pgTAP/RLS и concurrency проходят;
- текущий GitHub commit имеет два зелёных CI jobs;
- в RC нет незакоммиченных файлов, secrets или неутверждённых функций.

### Phase B — Staging acceptance: TASK-079, TASK-146, TASK-080, TASK-022,
TASK-038, TASK-118, TASK-147

- staging использует только live adapters и staging resources;
- миграции staging совпадают с RC;
- Owner/Seller/auth/receipt/sale/cancellation/exchange/reports/images проходят;
- нет P0/P1 defects и необъяснимых reconciliation discrepancies.

### Phase C — Operational readiness: TASK-081, TASK-082, TASK-148

- свежий backup существует и доступ ограничен;
- восстановление database и images реально выполнено в изолированное окружение;
- rollback приложения и данных проверен;
- security/rate-limit/pilot-capacity smoke не выявляет launch blocker.

### Phase D — Production readiness: TASK-083—TASK-086, TASK-149

- production изолирован от staging;
- SMTP/Auth работают на production domain;
- migration rehearsal и recovery доказаны;
- люди, инструкции, release tag, launch window и ответственные определены.

### Phase E — Launch: TASK-150, TASK-087, TASK-088, TASK-151

- production smoke не изменяет реальные данные неконтролируемо;
- начальный остаток подписан Owner и воспроизводится из movements;
- пять pilot accounts работают на своих устройствах;
- пилот проходит согласованный период с ежедневной сверкой;
- нет открытых P0/P1, backups свежие, monitoring и reconciliation зелёные.

## 6. Decision gates

Эти решения не блокируют TASK-142 и принимаются только перед соответствующей задачей:

1. До TASK-083/TASK-149: monitoring provider, retention и получатели production alerts.
2. TASK-081/082: backup retention, RPO/RTO и место восстановления.
3. TASK-118: Owner approval выполнен; fixture archive и colour normalization reconciled.
4. TASK-084: production domain, SMTP provider и язык email template.
5. TASK-087: способ первичного ввода inventory и человек, подписывающий сверку.
6. TASK-088: продолжительность pilot; рекомендация — минимум 7 рабочих дней.

## 7. Definition of launched

Проект считается запущенным не после deploy, а после TASK-151, когда Zebra Boutique
ежедневно выполняет реальные receipts/sales, остатки и payments сходятся, Owner/Seller
работают только в разрешённых границах, monitoring/backups/restore подтверждены и нет
открытых критических инцидентов.
