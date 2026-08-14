# Статус проекта

Обновлено: 2026-08-14

Текущая фаза: подготовка Clothing Pilot Release Candidate

## Где мы остановились

- Последняя завершённая задача: [TASK-143](tasks/TASK-143.md).
- Текущий шаг launch plan: **3 из 24**.
- Текущая задача: [TASK-117](tasks/TASK-117.md) — `pending`, работа ещё не начата.
- Следующая после неё: [TASK-144](tasks/TASK-144.md), но её нельзя начинать автоматически.
- Команда для продолжения: **`Выполни TASK-117`**.

После завершения TASK-117 агент обязан записать здесь TASK-117 как последнюю
завершённую, переключить текущую задачу на TASK-144 и остановиться до команды
`Выполни TASK-144`.

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
| Vitest | 73 files / 172 tests проходят локально на текущем commit |
| Demo build | Проходит |
| Live build | Проходит |
| TypeScript | Проходит как часть production builds |
| Playwright | 19 сценариев × 3 viewport = 57; два последовательных полных прогона проходят 57/57 без retry после фикса animation boundary в TASK-142 |
| Lint | Non-interactive ESLint CLI проходит с 0 errors; 24 существующих warnings остаются видимыми; lint включён в frontend CI job |
| Database | 27 migrations, 13 pgTAP files, 162 SQL assertions |
| Concurrency | Harness существует для sale/sale, sale/adjustment, sale/exchange |
| Current GitHub CI | Run `31816406792` на `8c5c81f`: Frontend checks и Local Supabase checks зелёные; database job применил clean migrations, прошёл 13 pgTAP files/162 assertions и concurrency |
| Последний SQL evidence | TASK-143: clean local `supabase:verify` и concurrency прошли; повторены и подтверждены отдельным зелёным GitHub CI run |

## Что проверено на staging ранее

- Sale одного variant разными EUR/USD lines, mixed payments, FX snapshots и rollback.
- Sale total из нескольких товаров и payment reconciliation.
- Receipt Istanbul business-date boundary, idempotency, movements и audit.
- Private product-images bucket/RPC/RLS, cross-store denial и carousel reload.
- Owner invitation и Seller membership status backend.
- Cancellation и exchange atomic flows.
- Magic Link Owner/Seller/unknown/used-link/logout/mobile matrix.

Это evidence не заменяет новый полный RC staging pass после синхронизации всех migrations.

## Текущие release blockers

1. Barcode migration должна быть пересмотрена под code-first/optional policy — TASK-117.
2. Owner Supplier/FX и часть Inventory controls требуют targeted EN/TR pass — TASK-144.
3. Staging не доказан как точная копия итогового RC migration set — TASK-079/TASK-146.
4. TASK-022 и TASK-038 ожидают manual staging evidence.
5. TASK-118 ожидает staging audit и Owner approval на cleanup.
6. Monitoring, backup/restore, production resources/SMTP и pilot ещё отсутствуют.

## Последовательность до запуска

1. TASK-142 — frontend release gate.
2. TASK-143 — database CI/RLS/concurrency gate.
3. TASK-117 — code-first/optional barcode.
4. TASK-144 — remaining EN/TR pass.
5. TASK-145 — Release Candidate и merge в `main`.
6. TASK-079 — отдельный staging frontend.
7. TASK-146 — staging migration synchronization.
8. TASK-080 — observability.
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
- `COMPLETED`: 106.
- `IN PROGRESS`: 1 — TASK-118.
- `pending`: 44.

Завершённые ID:

- TASK-001—TASK-021;
- TASK-023—TASK-037;
- TASK-039—TASK-078;
- TASK-101—TASK-116;
- TASK-123;
- TASK-131—TASK-143.

Незавершённые launch-path tasks перечислены в разделе выше. Post-launch pending tasks:

- TASK-089—TASK-100;
- TASK-119—TASK-122;
- TASK-124—TASK-130.

## Границы и известные риски

- Production не изменялся и реальные данные ещё не загружались.
- Staging содержит legacy/test colors; cleanup разрешён только после TASK-118 audit и Owner approval.
- TASK-022 требует fresh upload плюс unsupported MIME/oversize rejection.
- TASK-038 требует staging desktop/mobile visual smoke; component/backend tests уже существуют.
- Current-head CI зелёный на review branch; merge в `main` остаётся отдельным gate TASK-145.
- `app/page.tsx` остаётся большим, но broad refactor отложен после pilot во избежание регрессий.
- XLSX structural tests существуют; visual open smoke выполняется в live Owner browser.
- Генерируемые test/visual-QA PDF в `tmp/` остаются локальными, игнорируются git и не удаляются автоматически.

## Следующий шаг

В новом или текущем чате владелец пишет: **`Выполни TASK-117`**.

Агент выполняет только TASK-117, фиксирует её evidence и статус, переводит указатель
на TASK-144 и останавливается. TASK-144 начинается только после отдельной команды
**`Выполни TASK-144`**.
