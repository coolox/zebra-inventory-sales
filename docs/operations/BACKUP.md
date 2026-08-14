# Backup policy — Clothing Pilot

Статус: **ожидает решения Owner для TASK-081**.

## Проверенное состояние staging — 2026-08-15

- Проект `zebra-retail-staging` находится на Supabase Free Plan.
- Dashboard подтверждает: Free Plan не включает scheduled database backups.
- В этой конфигурации нет доступных database backup artifacts или retention.
- Нативные database backups Supabase не включают objects из Storage API: они
  сохраняют только metadata объектов. Поэтому private bucket `product-images`
  требует отдельного file backup.
- Production не создан и не проверялся.

## Требуемая политика для Clothing Pilot

| Контур | Частота | Retention | Место | Ответственный |
|---|---|---|---|---|
| Staging Postgres | ежедневно | не менее 7 daily copies | managed Supabase backup **или** encrypted off-site dump | Owner |
| Staging `product-images` | ежедневно после DB dump | не менее 14 daily copies | отдельный private encrypted object archive | Owner |
| Restore rehearsal | один раз до production | evidence хранится в TASK-082 | отдельный restore project | Owner + agent |

Ни database dump, ни file archive не попадают в git, GitHub Actions logs или
публичный bucket. Доступ разрешён только Owner и выделенному backup operator;
secrets хранятся только в platform secret store и никогда не записываются в
репозиторий.

## Доступные варианты

### A — рекомендуемый

Перевести **только staging** на Supabase Pro. Это включает ежедневные database
backups с retention 7 дней. Отдельно создать Owner-controlled encrypted private
object-storage archive для зеркала `product-images` и дать агенту название
провайдера/bucket без секретов. После этого TASK-081 настроит и проверит daily
file mirror, свежий DB artifact, artifact list/retention и access boundary.

### B — без перехода на Pro

Owner создаёт private encrypted archive и platform secrets; workflow выполняет
ежедневные Supabase CLI logical DB dumps и file mirror в archive. Для этого
требуются заранее созданные Owner secrets (DB connection + storage/archive
credentials) и согласие на scheduled GitHub Actions. Значения секретов агент
не читает и не принимает в чате.

## Что требуется от Owner

Выбрать A или B и назвать private archive provider/bucket либо подтвердить, что
его нужно создать. До этого TASK-081 не может включить или проверить реальный
backup без неявной оплаты, доступа к внешнему storage или секретов.

## Источники

- [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups)
  — plan eligibility, retention, Free-tier off-site dump guidance и исключение
  Storage objects из database backups.
- [Supabase automated GitHub Actions backups](https://supabase.com/docs/guides/deployment/ci/backups)
  — официальный вариант scheduled logical dumps.
