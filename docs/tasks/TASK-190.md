# TASK-190 — Закрыть bug intake и зафиксировать remediation → publication plan

Статус: COMPLETED

Приоритет: P0 — release coordination.

Источник: Owner сообщил, что сбор багов завершён, 2026-08-21.

## Результат bug intake

- Сбор Owner feedback завершён.
- Все findings и requests записаны отдельными task-файлами TASK-170—TASK-189.
- Production publication остаётся запрещена до исправления, общего staging Preview,
  physical Owner/Seller acceptance и отдельного Go/No-Go.
- TASK-169 Auth acceptance отложена до нового общего Preview: проверять callback на
  старом уникальном Vercel URL бессмысленно, если remediation создаст новый URL.

## Где считается зафиксированным результат

Для каждого TASK источник правды — его `docs/tasks/TASK-NNN.md`:

1. `pending` — finding записан, исправление не началось.
2. `IN PROGRESS` — выполняется только эта задача.
3. Реализация хранится в code/migration/tests; устное обещание не считается fix.
4. `COMPLETED` допустим только после acceptance criteria и записанного evidence.
5. `CHANGELOG.md` содержит краткий итог, `PROJECT_STATUS.md` — единственный текущий
   указатель, `ROADMAP.md` — полный порядок до запуска.

Physical-only evidence не подменяется browser simulation. Для defect, который нельзя
честно закрыть без устройства, task остаётся незавершённой либо его physical gate
явно переносится в общий TASK-165 walkthrough без заявления, что device bug уже
подтверждён как исправленный.

## Порядок исправлений

Каждая строка выполняется отдельной сессией/командой Owner.

### Wave A — financial/data correctness

1. TASK-179 — единая Istanbul business-date boundary.
2. TASK-183 — confirmed revenue/count mismatch после устранения date ambiguity.
3. TASK-176 — silent failure Product code Save.
4. TASK-175 — lock existing model identity в Add colour.
5. TASK-171 — exchange payment difference/top-up in ledger/history/reports.
6. TASK-182 — Seller attribution name → approved email.
7. TASK-174 — понятный Reconciliation financial context.
8. TASK-187 — полный Turkish Audit Log business copy.
9. TASK-189 — полные mobile KPI money/count values.

### Wave B — controlled workflow and product improvements

10. TASK-184 — Product code → colour → size Exchange picker.
11. TASK-177 — audited Edit Product scope and threshold relocation.
12. TASK-186 — historical sale-line photo strategy and fullscreen viewer.
13. TASK-178 — swipe gallery and safe private-photo deletion.
14. TASK-172 — modern light-theme Sales Trend bars.
15. TASK-173 — enabled light-theme secondary action affordance.
16. TASK-185 — `Merhaba {name}, bol satışlar!` copy.
17. TASK-181 — professional Arslan Ram attribution.
18. TASK-188 — Owner Cash/Kasa report with exports.

### Wave C — shared mobile/staging acceptance boundary

19. TASK-170 — Android keyboard-dismiss phantom input; place near staging so Redmi 14
    physical evidence follows immediately rather than being simulated locally.
20. Publish one reviewed consolidated staging Preview; Production untouched.
21. Resume TASK-169 and point staging Auth only to the exact new Preview/callback.
22. TASK-180 — supported iPhone Safari Home Screen install + fresh Magic Link.
23. Resume TASK-165 full Owner/Seller iPhone/Android walkthrough, including targeted
    rechecks for every affected flow.

## Gates before publication

- Every TASK-170—TASK-189 completed with evidence or explicitly excluded by a new
  Owner decision; no silent deferral.
- Relevant targeted tests per task; final full Vitest, lint, demo/live builds,
  Playwright and database/RLS/concurrency checks for touched backend boundaries.
- Consolidated staging uses live adapters only; exact migrations and Auth callback;
  no mock fallback, Production mutation or secrets in evidence.
- Owner/Seller physical iPhone and Redmi 14 walkthrough passes; findings create new
  tasks and only affected checks repeat.
- TASK-149 renewed Go/No-Go records explicit Owner `GO`, immutable release tag,
  monitoring/roles/window and rollback readiness.
- Only then TASK-150 may publish the exact accepted release to Production under a
  separate explicit Owner command; real inventory is loaded afterwards in TASK-087.

## Исторический handoff на момент завершения TASK-190

TASK-179 была first financial correctness blocker и впоследствии завершена.

Эта прежняя команда больше не является routing instruction. Актуальная команда
всегда находится только в начале `docs/PROJECT_STATUS.md`.

## Evidence

- TASK-170—TASK-189 exist as 20 separate files with severity, reproduction/boundary
  and acceptance criteria.
- Status accounting на момент завершения этой task: 190 task files total; TASK-179
  была единственным `NEXT` item. Это историческое evidence, не текущий pointer.
- Documentation whitespace validation: `git diff --check` passed.
