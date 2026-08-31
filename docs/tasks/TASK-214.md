# TASK-214 — Собрать и проверить единый staging remediation build

Статус: IN PROGRESS

## Цель

Опубликовать один reviewed staging build, в котором доступны fixes TASK-203,
TASK-205, TASK-207 и TASK-208, а также уже активированный staging FX UI, и
получить physical Owner/Seller acceptance. Production не менять.

## Границы

- Включить только audit-approved remediation scope; не смешивать invoice AI
  (TASK-089—093/TASK-119—122) или label-assisted sales (TASK-124—130).
- Создать version-controlled commit только после точного review локальных
  changes; не затирать и не захватывать unrelated dirty worktree.
- Для staging задать корректные public Supabase environment variables без
  раскрытия значений в repo/evidence.
- Не выполнять production deploy, production migrations или production secret
  changes без новой команды Owner.

## Критерии готовности

- Staging URL указывает на reviewed remediation commit, а Auth/logout не
  страдает от missing browser environment variables.
- Owner подтверждает: Seller logout → Owner fresh Magic Link, live catalog при
  недоступной фото, Android PWA Home Screen launch, mobile camera photo
  save/reopen и FX source/carry warning.
- Seller не может менять FX или видеть sync-health management controls.
- Результат каждой проверки и fallback/отдельный defect записаны без личных
  данных и секретов.
- Relevant tests, live build и `git diff --check` зелёные.

## Зависимость

TASK-213 completed: scope и prerequisites определены в
`docs/operations/REMEDIATION_BUILD_READINESS.md`.
