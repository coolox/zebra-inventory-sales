# Статус проекта

Обновлено: 2026-08-15

Текущая фаза: Clothing Pilot staging product-image acceptance

## Где мы остановились

- Последняя завершённая задача: [TASK-080](tasks/TASK-080.md).
- Текущий шаг launch plan: **9 из 24**.
- Текущая задача: [TASK-022](tasks/TASK-022.md) — `IN PROGRESS`; она не завершена.
- Команда для продолжения: **войти Owner в staging tab и написать `продолжи TASK-022`**.

TASK-145 зафиксировала и проверила кодовый RC
`f838f78680b4fb5a18fd5600f194ec5defd335a6`: GitHub Actions run `31822493717`
зелёный для Frontend и Local Supabase. TASK-079 опубликовала staging Preview из
`main`: `https://zebra-inventory-sales-51z34xyje-cooloxs-projects.vercel.app`.
Staging Supabase callback указывает только на этот Preview; production resources
не настраивались и не изменялись. TASK-146 синхронизировала staging history/schema
с полным 28-migration RC set; remote dry-run теперь `upToDate`.

TASK-080 добавила opt-in provider-neutral observability: redacted structured
client/server errors, global fallback и безопасный rate-limited endpoint.
Vercel Preview `https://zebra-inventory-sales-fkn819bfk-cooloxs-projects.vercel.app`
собран Ready в live mode; synthetic event вернул `204` и подтвердил, что raw email
и Bearer value редактируются в runtime log. Preview-only observability включён,
Production не изменялся.

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
| Database | 28 migrations, 13 pgTAP files, 169 SQL assertions |
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
- Staging migration chain совпадает с RC: 28 local/remote IDs, code-first/barcode,
  archive, reporting/reconciliation и Seller summary RPC/RLS проверены; Owner/Seller
  smoke прошёл, а Seller Owner-only reconciliation отклонён.

Это evidence не заменяет новый полный RC staging pass после синхронизации всех migrations.

## Текущие release blockers

1. TASK-022 ждёт Owner sign-in в staging для fresh image upload/reload и negative checks.
2. TASK-118 ожидает staging audit и Owner approval на cleanup.
3. Backup/restore, production resources/SMTP и pilot ещё отсутствуют.
4. До production Owner должен выбрать monitoring provider, retention и recipients;
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
9. TASK-022 — fresh product-image smoke.
10. TASK-038 — Seller status UI staging smoke.
11. TASK-118 — staging color audit/approved cleanup.
12. TASK-147 — full staging acceptance.
13. TASK-081 — backups.
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
- `COMPLETED`: 112.
- `IN PROGRESS`: 1 — TASK-118.
- `pending`: 38.

Завершённые ID:

- TASK-001—TASK-021;
- TASK-023—TASK-037;
- TASK-039—TASK-080;
- TASK-101—TASK-116;
- TASK-123;
- TASK-131—TASK-146; TASK-117.

Незавершённые launch-path tasks перечислены в разделе выше. Post-launch pending tasks:

- TASK-089—TASK-100;
- TASK-119—TASK-122;
- TASK-124—TASK-130.

## Границы и известные риски

- Production не изменялся и реальные данные ещё не загружались.
- Каждый новый Vercel Preview получает уникальный URL. Supabase staging Site URL и
  callback сейчас остаются на предыдущем проверенном Preview; перед следующим
  authenticated manual smoke их нужно переключить на выбранный актуальный Preview.
- TASK-146 оставила schema-only rollback checkpoint; полноценные managed backup и
  restore rehearsal ещё обязательны в TASK-081/TASK-082.
- Staging содержит legacy/test colors; cleanup разрешён только после TASK-118 audit и Owner approval.
- TASK-022 требует fresh upload плюс unsupported MIME/oversize rejection.
- TASK-038 требует staging desktop/mobile visual smoke; component/backend tests уже существуют.
- Кодовый RC `f838f78680b4fb5a18fd5600f194ec5defd335a6` прошёл два GitHub CI jobs;
  merge в `main` зафиксирован в TASK-145.
- `app/page.tsx` остаётся большим, но broad refactor отложен после pilot во избежание регрессий.
- XLSX structural tests существуют; visual open smoke выполняется в live Owner browser.
- Генерируемые test/visual-QA PDF в `tmp/` остаются локальными, игнорируются git и не удаляются автоматически.

## Следующий шаг

В новом или текущем чате Owner входит в staging и пишет: **`продолжи TASK-022`**.

Агент продолжает только TASK-022, фиксирует её evidence и статус, переводит указатель
на следующую задачу и останавливается. До Owner sign-in обязательная fresh upload
проверка не может быть заменена предыдущими объектами или локальными test-ами.
