# Статус проекта

Обновлено: 2026-09-01

Текущая фаза: release-readiness audit before one consolidated remediation build.

## Единственный указатель продолжения

- Последняя завершённая задача: [TASK-192](tasks/TASK-192.md) — Turkish greeting
  больше не повторяет пожелание в heading.
- Последняя завершённая задача: [TASK-194](tasks/TASK-194.md) — active Audit Log
  category chip снова читаем в light theme.
- Последняя завершённая задача: [TASK-196](tasks/TASK-196.md) — Sale Details
  photo-first demo fixture восстановлен.
- Последняя завершённая задача: [TASK-197](tasks/TASK-197.md) — Sell-first
  Product Details и единая Owner-точка Product Edit готовы.
- Последняя завершённая задача: [TASK-198](tasks/TASK-198.md) — Owner photo
  deletion после сохранения проверяемо и в local demo.
- Последняя завершённая задача: [TASK-165](tasks/TASK-165.md) — Owner подтвердил
  shared staging/device checklist without new P0/P1 finding.
- Последняя завершённая задача: [TASK-202](tasks/TASK-202.md) — production
  encrypted checkpoint `production-2026-08-23.tar.gz.age` checksum-verified on the
  Owner VPS.
- Последняя завершённая задача: [TASK-084](tasks/TASK-084.md) — production
  Magic Link delivery, redirect, unknown/non-member, reused and expired-link matrix
  completed on the deployed callback.
- Последняя завершённая задача: [TASK-150](tasks/TASK-150.md) — production RC.18,
  Auth/role matrix and reconciled controlled transaction smoke completed.
- Последняя завершённая задача: [TASK-087](tasks/TASK-087.md) — Owner-controlled
  live import completed: 18 models, 118 variants, 122 units; physical
  reconciliation is signed with no discrepancies.
- Последняя завершённая задача: [TASK-204](tasks/TASK-204.md) — финальный Turkish
  sales landing принят Owner, mobile dashboard исправлен и Sites version 5
  опубликована с успешной HTTP-проверкой.
- Последняя завершённая задача: [TASK-207](tasks/TASK-207.md) — Logout теперь
  очищает server/browser session с bounded fallback и всегда ведёт на чистый
  login; targeted tests и demo/live builds зелёные.
- Последняя завершённая задача: [TASK-208](tasks/TASK-208.md) — private product
  photo signed-URL error больше не прерывает catalog/workspace; 7 targeted tests
  и demo/live builds зелёные.
- Последняя завершённая задача: [TASK-209](tasks/TASK-209.md) — строгий TCMB
  `ForexSelling` parser нормализует EUR/USD/TRY без database write; 8 unit tests
  и demo/default production builds зелёные.
- Последняя завершённая задача: [TASK-210](tasks/TASK-210.md) — FX provenance
  schema, visible manual source/status и audited Owner override подтверждены
  clean local pgTAP (10/10) и demo/live builds.
- Последняя завершённая задача: [TASK-211](tasks/TASK-211.md) — protected TCMB
  sync implementation, idempotency/carry/failure state и schedule готовы локально;
  staging activation требует отдельной Owner authority.
- Приостановленная задача: [TASK-088](tasks/TASK-088.md) — pilot evidence сохранено
  до возвращения Owner после FX work.
- Приостановленная задача: [TASK-203](tasks/TASK-203.md) — PWA code и automated
  checks готовы; publication и physical Android acceptance ожидают Owner.
- Приостановленная задача: [TASK-205](tasks/TASK-205.md) — mobile camera capture
  code и component/build checks готовы; publication и physical acceptance войдут
  в один remediation build.
- Приостановленная задача: [TASK-206](tasks/TASK-206.md) — FX parent разделён на
  безопасные vertical slices после решения Owner о provider и rate basis.
- Приостановленная задача: [TASK-212](tasks/TASK-212.md) — staging FX backend
  technical evidence готово; visual acceptance ждёт общего readiness audit и
  frontend remediation build.
- Последняя завершённая задача: [TASK-213](tasks/TASK-213.md) — audit подтвердил
  scope общего remediation build и отделил его от не реализованных AI backlog.
- Текущая задача: [TASK-214](tasks/TASK-214.md) — `pending`; собрать reviewed
  staging remediation build и пройти physical Owner/Seller acceptance.
- Команда для продолжения: `Выполни TASK-214`.

Pilot follow-up recorded: [TASK-203](tasks/TASK-203.md) — Android Chrome PWA
installation is not yet guaranteed; Chrome web use/Home Screen shortcut is the
current safe workaround. Do not implement TASK-203 until Owner selects it.

Pilot follow-up recorded: [TASK-205](tasks/TASK-205.md) — Product Details photo
upload needs a direct mobile camera capture action; taking a photo first and
selecting it from gallery is the current safe workaround. Do not implement
TASK-205 until Owner selects it.

Post-pilot product intake: [список следующих фич](POST_PILOT_FEATURES.md). Первый
пункт уточняет существующий AI receipt backlog TASK-089—TASK-093/TASK-119—TASK-122:
`Receive product` → camera/upload накладной → проверяемая предзаполненная форма →
атомарное сохранение, private source storage и Owner-архив всех накладных. Это не
меняет текущий указатель TASK-088 и не разрешает начинать backlog без новой команды.
Второй пункт уточняет TASK-124—TASK-130: camera-first серия этикеток после ухода
клиента, единая исправляемая sale form, price/payment и явное атомарное сохранение.
Третий пункт записан как [TASK-206](tasks/TASK-206.md): автоматическая server-side
загрузка дневных FX rates с source metadata, weekend/holiday carry-forward,
audited Owner fallback и без пересчёта historical snapshots.

### Зафиксированное следующее направление Owner

После закрытия pilot Owner хочет отдельную marketing-задачу: презентацию и
landing page для продажи Zebra Retail потенциальным владельцам магазинов.
Это не часть TASK-088 и не разрешает создавать landing или менять production,
пока Owner не завершит pilot либо явно не сменит приоритет.

[TASK-204](tasks/TASK-204.md) содержит утверждённый planning brief и стала текущей
по прямой команде Owner от 2026-08-28. TASK-088 временно `PAUSED`; её незавершённый
pilot handoff остаётся сохранённым.
Owner marketing intake от 2026-08-28 добавил 11 исходных преимуществ и
подтверждённые возможности продукта; brief теперь явно отделяет current proof от
AI/automation/multi-store `Coming next` claims.
Owner уточнил, что будущий commercial landing должен продавать AI invoice receiving
как доступную функцию; TASK-204 разрешает этот основной claim только после
implementation/acceptance evidence TASK-089—TASK-093/TASK-119—TASK-122.

Никакая команда внутри completed task-файла не является текущей. Источник текущей
команды — только этот раздел.

## Временная пауза Owner visual intake

Owner снова собирает локальные visual/copy observations. [TASK-192](tasks/TASK-192.md)
фиксирует Turkish greeting; [TASK-193](tasks/TASK-193.md),
[TASK-194](tasks/TASK-194.md) и [TASK-195](tasks/TASK-195.md) фиксируют light-theme
contrast findings; [TASK-196](tasks/TASK-196.md) фиксирует photo-first Sale Details
acceptance gap; [TASK-197](tasks/TASK-197.md) фиксирует unified Product edit и
Sell-first hierarchy; [TASK-198](tasks/TASK-198.md) фиксирует доступное после
сохранения Owner photo deletion и local-demo acceptance. Owner 2026-08-22
авторизовал последовательную реализацию TASK-192—TASK-198. Staging/production
до TASK-165 не менять.

## Фактический уровень приложения

- Clothing MVP для Zebra Boutique функционально реализован как Next.js web/PWA с
  отдельными demo/live режимами, EN/TR, Light/Dark и responsive layouts.
- Owner/Seller authorization, store boundaries, Magic Link, private product photos,
  receipts, sales, mixed payments, cancellation, exchange, audit, reports и
  reconciliation защищены server-side Supabase RLS/RPC boundaries.
- Денежные и складские writes атомарны и аудируемы; concurrency, idempotency и
  signed-JWT authorization имеют local integration evidence.
- Production Supabase schema и Vercel production RC.18 опубликованы; initial
  Zebra Boutique catalog/stock is imported and physically reconciled. Controlled
  Seller access exists; Clothing Pilot is initialized, while daily real-operation
  evidence is still pending.
- Telegram, AI receipt/labels и multi-store не входят в первый Clothing Pilot.

## TASK-191 release-gate evidence

| Gate | Текущий результат |
|---|---|
| Vitest | 90 files / 243 tests passed |
| ESLint | 0 errors; 26 non-blocking warnings остаются видимыми |
| Demo build | passed |
| Live build | passed |
| Playwright | 78/78 desktop/tablet/mobile checks passed |
| Fresh migrations | 37 migrations applied by clean local reset |
| pgTAP / RLS / RPC | 20 files / 214 assertions passed |
| Concurrency | sale/sale, sale/adjustment, sale/exchange and repeated clean run passed |
| Security/capacity | 27 authorization/idempotency/reconciliation checks passed; five-user burst slowest 184 ms (<5 s) |
| Whitespace | `git diff --check` passed before commit |

TASK-191 добавила forward migration
`20260822120000_preserve_receipt_color_canonicalization.sql`: поздний TASK-175
receipt RPC снова сохраняет canonical colour boundary TASK-118, не ослабляя lock
существующей model identity.

## Что должен закрыть TASK-165

1. Опубликовать один reviewed staging Preview именно из consolidated TASK-191 commit;
   Production не менять.
2. Проверить live-only environment/no-mock boundary и exact staging Auth callback.
3. На физических iPhone и Redmi 14 пройти Owner/Seller login/logout, Receive Flow,
   Product code keyboard dismiss, search/sale, exchange top-up, Adjust Stock,
   Movement History, Audit Log, Reports/Kasa и responsive KPI.
4. Сравнить Owner dashboard, Seller Store/My totals, History и Reports на одном
   store/day snapshot после manual refresh.
5. Каждый новый defect вынести в отдельную TASK; не исправлять его внутри TASK-165.

## Открытые launch gates

- [TASK-084](tasks/TASK-084.md) — `COMPLETED`: production Auth/SMTP, exact redirect
  boundary and the full delivery/unknown/reused/expired acceptance matrix are green.
- [TASK-165](tasks/TASK-165.md) — `COMPLETED`: Owner подтвердил shared
  staging/device checklist without new P0/P1 finding.
- [TASK-149](tasks/TASK-149.md) — `BLOCKED` historical Go/No-Go record: its former
  TASK-084 Auth condition is now complete and Owner `GO` was issued. Do not treat
  this historical status as a blocker for the current TASK-150 handoff.
- [TASK-202](tasks/TASK-202.md) — `COMPLETED`: run `32607243580` created the
  isolated encrypted checkpoint and passed VPS-side checksum verification.
- [TASK-150](tasks/TASK-150.md) — `COMPLETED`: deploy, Auth/role checks and
  reconciled controlled transaction smoke are green.
- [TASK-087](tasks/TASK-087.md) — `COMPLETED`: real initial inventory is
  live-imported and Owner-signed as 122 units with no discrepancies.

TASK-087 is closed. TASK-088 may begin only on the Owner command recorded above.

## Task accounting

- Всего task-файлов: 214.
- `COMPLETED` / legacy `completed`: 183.
- `pending`: 25, включая post-launch backlog.
- `WAITING`: 0.
- `BLOCKED`: 1 — TASK-149.
- `IN PROGRESS`: 0.
- `PAUSED`: 5 — TASK-088, TASK-203, TASK-205, TASK-206, TASK-212.

Завершённые диапазоны:

- TASK-001—TASK-084;
- TASK-085—TASK-087;
- TASK-101—TASK-118;
- TASK-123;
- TASK-131—TASK-148;
- TASK-150;
- TASK-152—TASK-164;
- TASK-166—TASK-191.
- TASK-202.

Post-launch pending scope: TASK-089—TASK-100, TASK-119—TASK-122,
TASK-124—TASK-130 и TASK-206.

## Безопасные границы продолжения

- Не читать и не записывать secret values в repository/evidence.
- Не использовать реальные customer/employee identities или данные в staging notes.
- Не подключать demo к production или legacy VPS.
- Не применять новую migration к staging/production вне соответствующей TASK и
  явной команды Owner.
- Исторические детали находятся в task-файлах, `CHANGELOG.md` и Git; они не должны
  дублироваться здесь как конкурирующие команды продолжения.
