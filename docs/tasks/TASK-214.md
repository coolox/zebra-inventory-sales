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

## Выполнение — 2026-09-01

- Reviewed remediation commit `304fcdb` содержит только согласованный code/test
  scope и отправлен в `main`; targeted Vitest 9 files / 38 tests и
  `npm run build:live` прошли. `git diff --check` зелёный.
- Publication пока намеренно не выполнена. Проверка Vercel показала, что
  подключённый проект имеет `NEXT_PUBLIC_APP_MODE`,
  `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` только в
  окружении **Production**. Отдельный staging/Preview environment для staging
  Supabase не настроен.
- Нельзя публиковать Preview без этих трёх variables: именно такой preview уже
  показывал `Missing Supabase browser environment variables`, поэтому он не
  годится для проверки Logout или live data.

Для продолжения Owner должен создать isolated Vercel staging project либо
добавить в Preview environment значения, соответствующие **только staging
Supabase** (не production): `NEXT_PUBLIC_APP_MODE=live`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` и при
необходимости `NEXT_PUBLIC_OBSERVABILITY_ENABLED`. Значения не передавать в
chat/repository. После этого эта задача публикует Preview и выполняет Owner/Seller
acceptance matrix.

2026-09-01: Owner сохранил три обязательные переменные в Vercel `Preview`; их
имена и окружение проверены через браузер, значения не раскрывались. Попытки
`vercel --yes` и `vercel deploy --yes --scope cooloxs-projects` вернули
`Not authorized`. В Vercel Project Settings → Git также указано, что проект не
подключён к Git repository, поэтому push в `main` не запускает deploy. Нужен
доступ/разрешение на Vercel deployment (или подключение Git repository) перед
следующей попыткой; production deployment не изменён.
