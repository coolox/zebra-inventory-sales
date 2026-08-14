# План запуска Zebra Retail — Clothing Pilot

Обновлено: 2026-08-15

Текущий этап: staging Seller status acceptance

Текущий шаг: 10 из 24 — TASK-038 (`NEXT`)

Команда для продолжения: `Выполни TASK-038`

Кодовый Clothing Pilot RC: `f838f78680b4fb5a18fd5600f194ec5defd335a6`.
GitHub Actions run `31822493717` прошёл Frontend и Local Supabase gates.

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

- 113 task-файлов имеют статус `COMPLETED`.
- На текущем commit локально проходят 80 Vitest files / 187 unit и component tests.
- Demo и live production builds проходят TypeScript/build validation.
- Есть 19 Playwright сценариев, запускаемых в desktop/tablet/mobile: два
  последовательных полных прогона проходят 57/57 без retry.
- Non-interactive ESLint CLI проходит с 0 errors и включён в frontend CI job;
  24 существующих warnings остаются видимыми.
- Есть 28 migrations и 13 pgTAP файлов с 169 SQL assertions.
- Есть concurrency harness для sale/sale, sale/adjustment и sale/exchange conflicts.
- Основные sale, receipt, image, auth, Seller status, cancellation и exchange flows уже
  имеют staging evidence; PWA подтверждена на Android/iOS.
- GitHub Actions выполняет frontend и database jobs без staging/production secrets.

### Что перепроверено и ещё не является зелёным release gate

- TASK-038 реализована частично и требует конкретного staging smoke check.
- TASK-118 имеет готовую UI normalization, но staging cleanup требует read-only audit,
  rollback plan и явного разрешения Owner.
- Production Supabase/Vercel, SMTP, monitoring, backup/restore и pilot ещё не созданы.

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
| 10 | **NEXT** | TASK-038 | Seller deactivate/reactivate UI подтверждён через staging desktop/mobile |
| 11 | PARTIAL | TASK-118 | Local UI normalization готова; staging audit/cleanup ждёт Owner approval и reconciliation |
| 12 | WAITING | TASK-147 | Полная Owner/Seller staging acceptance matrix зелёная, defects triaged |
| 13 | WAITING | TASK-081 | Database/Storage backups и retention включены и проверены |
| 14 | WAITING | TASK-082 | Изолированный restore rehearsal и rollback plan доказаны |
| 15 | WAITING | TASK-148 | Security, authorization, rate-limit и pilot-capacity smoke не находят release blockers |
| 16 | WAITING | TASK-083 | Изолированные production Supabase и Vercel созданы без реальных данных |
| 17 | WAITING | TASK-084 | Production SMTP, redirects и Magic Link matrix проверены |
| 18 | WAITING | TASK-085 | Production-like migration rehearsal, bootstrap и recovery проходят с нуля |
| 19 | WAITING | TASK-086 | Owner/Seller runbooks и обучение пяти pilot devices завершены |
| 20 | WAITING | TASK-149 | Формальный Go/No-Go: release tag, approvals, rollback owner и launch window зафиксированы |
| 21 | WAITING | TASK-150 | Тот же Release Candidate развёрнут в production; auth/data/transaction smoke зелёный |
| 22 | WAITING | TASK-087 | Реальный clothing catalog/stock загружен и физически reconciled |
| 23 | WAITING | TASK-088 | Zebra Boutique работает в контролируемом pilot с ежедневной сверкой |
| 24 | WAITING | TASK-151 | Pilot exit подписан; production передан в обычную эксплуатацию |

### Как работать с планом в любом новом чате

1. Owner копирует из `PROJECT_STATUS.md` строку `Команда для продолжения` и пишет,
   например: `Выполни TASK-038`.
2. Агент читает `AGENTS.md` → `PROJECT_STATUS.md` → только `TASK-038.md`.
3. Перед кодом агент ставит TASK-038 в `IN PROGRESS`. Если чат прервётся, следующий
   агент продолжит TASK-038, а не начнёт другой шаг.
4. После выполнения агент записывает проверки в TASK-038 и меняет статус на `COMPLETED`.
5. В этой таблице TASK-038 становится `DONE`, следующая задача — единственным `NEXT`.
6. В `PROJECT_STATUS.md` меняются последняя завершённая TASK, текущий шаг и команда
   `Выполни TASK-038`.
7. Финальный ответ заканчивается результатом TASK-038 и приглашением дать точную
   следующую команду. Агент не начинает TASK-038 самостоятельно.

Если задача заблокирована, она остаётся текущей, получает статус `BLOCKED` с причиной,
а указатель не переходит дальше без решения Owner.

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
3. TASK-118: явное Owner approval точного списка staging records на cleanup.
4. TASK-084: production domain, SMTP provider и язык email template.
5. TASK-087: способ первичного ввода inventory и человек, подписывающий сверку.
6. TASK-088: продолжительность pilot; рекомендация — минимум 7 рабочих дней.

## 7. Definition of launched

Проект считается запущенным не после deploy, а после TASK-151, когда Zebra Boutique
ежедневно выполняет реальные receipts/sales, остатки и payments сходятся, Owner/Seller
работают только в разрешённых границах, monitoring/backups/restore подтверждены и нет
открытых критических инцидентов.
