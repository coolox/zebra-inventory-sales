# TASK-083 — Создать production Supabase и Vercel projects

Статус: COMPLETED

## Цель

Подготовить изолированные production resources без загрузки реальных данных до approval gate.

## Предполагаемые файлы

- `.env.example`
- `docs/operations/PRODUCTION_SETUP.md`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-078, TASK-082.

## Критерии готовности

- Production отделён от staging project IDs/resources.
- Secrets заданы только через hosted environment management.
- Data API/RLS defaults соответствуют decisions.
- Приложение ещё не запущено для pilot users без отдельного launch step.

## Тесты

- Environment isolation checklist.
- No secrets/git scan.
- Empty production health check.

## Текущее состояние — 2026-08-16

TASK-083 начата, production resources не создавались и существующие projects не
изменялись. Supabase organization `coolox` находится на Free plan и уже использует
оба project slots: `zebra-retail-staging` и отдельный paused `coolox's Project`
(AWS `eu-west-1`). Production project отсутствует.

Для продолжения Owner должен выбрать один вариант:

1. подтвердить upgrade organization до платного plan и target region для нового
   production project;
2. явно разрешить удаление указанного paused project для освобождения Free slot;
3. создать/предоставить отдельную Supabase organization для production.

После выбора Owner вводит database password непосредственно в hosted dashboard; agent
не читает и не хранит это значение. Отдельный Vercel production project также ещё не
создавался: его provisioning выполняется только после выбранной production Supabase
границы, чтобы не запустить deployment с неверными environment resources.

### Выполнение варианта 2

Owner явно разрешил удалить paused `coolox's Project`
(`gqzcyfeipqkcbqiuuezl`). Platform не позволяет delete paused project, поэтому он был
возобновлён как необходимый промежуточный шаг. Delete confirmation была выполнена для
точно этого имени. Первый запрос получил platform cooldown `15 minutes`; после него
Supabase подтвердил permanent deletion. Free slot освобождён, в organization остался
только `zebra-retail-staging`. Staging и Vercel не изменялись.

Для создания нового production Supabase project всё ещё требуется явный выбор Owner
target region: architecture фиксирует изоляцию production/staging, но не регион.
Рекомендуемый вариант — `eu-central-1` (как staging) для одинаковой platform
топологии. Owner вводит database password непосредственно в dashboard; agent не
видит и не хранит пароль.

## Результат — 2026-08-16

TASK-083 завершена.

- Owner подтвердил `eu-central-1`; production Supabase project создан отдельно от
  staging. Initial health check: `Healthy`, no migrations, no branches, no backups,
  zero requests/errors and no real data.
- D-043 применено при создании: Data API enabled, automatic table exposure disabled,
  automatic RLS enabled. API keys и database password не открывались; никакие
  endpoint, key, password или project URL не записывались.
- Отдельный Vercel project `zebra-retail-production` создан как empty project и
  переименован. Git disconnected; environment values, Preview deployments и
  Production deployment отсутствуют. Application не доступно pilot users.
- [PRODUCTION_SETUP.md](../operations/PRODUCTION_SETUP.md) задаёт safe hosted-only
  secret handoff. `.env.example` остаётся template без values.

Удаление Owner-approved paused Supabase project было необходимо, чтобы освободить
Free slot. Staging project не изменялся. Production Auth/SMTP, migrations, data,
Storage и deployment намеренно не начинались: это границы TASK-084/TASK-085/TASK-150.
