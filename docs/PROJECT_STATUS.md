# Статус проекта

Обновлено: 2026-08-24

Текущая фаза: consolidated staging and physical acceptance before production Go/No-Go.

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
- Текущая задача: [TASK-150](tasks/TASK-150.md) — `IN PROGRESS`: production RC
  deployment and controlled smoke evidence await final task handoff.
- Команда для продолжения: `Выполни TASK-150`. Не начинать TASK-087 или pilot.

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
- Production Supabase schema и Vercel production RC.18 опубликованы; реальные
  товары/остатки не загружены, pilot users не открыты и Clothing Pilot не начат.
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
- TASK-150 controlled Auth/transaction smoke, TASK-087 initial inventory, TASK-088
  pilot и TASK-151 pilot exit остаются последовательными следующими launch steps.

Production publication was authorized by Owner; TASK-150 is the sole current
handoff. TASK-087 and pilot remain prohibited until a new Owner command.

## Task accounting

- Всего task-файлов: 202.
- `COMPLETED` / legacy `completed`: 174.
- `pending`: 29, post-launch backlog.
- `WAITING`: 0.
- `BLOCKED`: 1 — TASK-149.
- `IN PROGRESS`: 1 — TASK-150.

Завершённые диапазоны:

- TASK-001—TASK-084;
- TASK-085—TASK-086;
- TASK-101—TASK-118;
- TASK-123;
- TASK-131—TASK-148;
- TASK-152—TASK-164;
- TASK-166—TASK-191.
- TASK-202.

Post-launch pending scope: TASK-089—TASK-100, TASK-119—TASK-122 и TASK-124—TASK-130.

## Безопасные границы продолжения

- Не читать и не записывать secret values в repository/evidence.
- Не использовать реальные customer/employee identities или данные в staging notes.
- Не подключать demo к production или legacy VPS.
- Не применять новую migration к staging/production вне соответствующей TASK и
  явной команды Owner.
- Исторические детали находятся в task-файлах, `CHANGELOG.md` и Git; они не должны
  дублироваться здесь как конкурирующие команды продолжения.
