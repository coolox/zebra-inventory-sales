# TASK-213 — Release-readiness audit перед общим remediation build

Статус: COMPLETED

## Цель

До единого опубликованного remediation build дать Owner точную картину: какие
зарегистрированные bugs уже имеют проверенный fix, какие next-version features
реализованы, а какие остаются backlog и потому не могут считаться частью build.

## Границы

- Только read-only audit кода, task evidence, staging state и release boundaries.
- Не публиковать Vercel/frontend, не менять production, не выполнять migrations
  вне уже применённого staging FX set.
- Список должен включать TASK-203, TASK-205, TASK-207, TASK-208, TASK-212 и
  Owner-approved invoice/label/FX next-version scope.

## Критерии готовности

- Есть один компактный matrix `готово / готово в коде, не опубликовано /
  не реализовано` с доказательствами и риском включения в общий build.
- Явно отделены current remediation release и крупные post-pilot features,
  требующие отдельных implementation tasks.
- Owner получает рекомендованный scope общего build и точные prerequisites для
  physical recheck.

## Результат — 2026-09-01

Audit завершён и сохранён в
[`REMEDIATION_BUILD_READINESS.md`](../operations/REMEDIATION_BUILD_READINESS.md).

- TASK-203, TASK-205, TASK-207 и TASK-208 имеют проверенные fixes, но ещё не
  входят в единый опубликованный frontend build. Текущий preview с отсутствующими
  browser Supabase environment variables нельзя использовать как UAT evidence
  Logout.
- Автоматические TCMB FX технически активированы только в staging; backend
  evidence green, а Owner visual acceptance ждёт корректного frontend build.
- Приёмка накладных и продажа по серии фото этикеток не реализованы: их pending
  task chains остаются отдельными post-pilot releases.
- Рекомендован scope следующего build: только четыре fixes и FX UI, без
  неготовых AI функций. Для этого создана pending TASK-214.

## Проверки

- Targeted Vitest: 8 files / 36 tests passed (Logout/Access Denied, signed URL,
  camera/gallery, PWA worker, TCMB parser/sync policy/FX UI).
- Read-only review task evidence, current dirty worktree и staging FX handoff.
