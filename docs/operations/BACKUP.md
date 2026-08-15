# Backup policy — Clothing Pilot

Статус: **Plan B selected; automation awaits safe VPS/GitHub secret setup**.

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
| Staging Postgres | ежедневно | 14 daily copies | encrypted off-site dump on Owner VPS | Owner |
| Staging `product-images` | ежедневно после DB dump | не менее 14 daily copies | отдельный private encrypted object archive | Owner |
| Restore rehearsal | один раз до production | evidence хранится в TASK-082 | отдельный restore project | Owner + agent |

Ни database dump, ни file archive не попадают в git, GitHub Actions logs или
публичный bucket. Доступ разрешён только Owner и выделенному backup operator;
secrets хранятся только в platform secret store и никогда не записываются в
репозиторий.

## Выбранный вариант B — Owner VPS

Owner выбрал daily off-site automation через GitHub Actions и свой VPS. Archive
содержит database roles/schema/data и complete `product-images` mirror в одном
`age`-encrypted archive. VPS получает только encrypted file, checksum и дату;
private `age` key остаётся вне GitHub/VPS.

GitHub-hosted runners не имеют direct IPv6 route к staging Postgres. Workflow
использует existing private `SUPABASE_DB_URL` только внутри runner и безопасно
преобразует его в staging Shared Transaction Pooler URL; пароль не выводится в
logs и не требует отдельного Secret.

Каждая SSH и `rsync` передача pin-ит тот же `BACKUP_VPS_KNOWN_HOSTS` public host
key, использует только `BACKUP_VPS_SSH_PRIVATE_KEY` и не опирается на runner-wide
`known_hosts`.

Workflow: [staging-backup.yml](../../.github/workflows/staging-backup.yml).
VPS bootstrap: [bootstrap-vps-backup-user.sh](../../scripts/backup/bootstrap-vps-backup-user.sh).

На VPS используется новый непривилегированный user `zebra-backup` и отдельный
path `/srv/zebra-backups/zebra-retail/staging`. Он не получает `sudo`, не
использует `/root/zebra` и не меняет `zebra-bot.service`.

## Настройка Owner без передачи секретов в чат

1. Создать отдельную SSH key pair для GitHub backup job и сохранить private key
   только в GitHub Secret `BACKUP_VPS_SSH_PRIVATE_KEY`.
2. Войти на VPS безопасным Owner способом и выполнить bootstrap с **public** key:

   ```bash
   sudo BACKUP_VPS_SSH_PUBLIC_KEY='ssh-ed25519 ...' \
     bash scripts/backup/bootstrap-vps-backup-user.sh
   ```

3. Добавить GitHub Secrets: `SUPABASE_DB_URL`, `SUPABASE_STORAGE_S3_ENDPOINT`,
   `SUPABASE_STORAGE_S3_REGION`, `SUPABASE_STORAGE_S3_ACCESS_KEY_ID`,
   `SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY`, `BACKUP_VPS_HOST`,
   `BACKUP_VPS_PORT`, `BACKUP_VPS_USER`, `BACKUP_VPS_PATH`,
   `BACKUP_VPS_SSH_PRIVATE_KEY`, `BACKUP_VPS_KNOWN_HOSTS`,
   `BACKUP_AGE_RECIPIENT`.
4. В Supabase Storage включить S3 protocol и создать server-side S3 access key.
   Он bypasses RLS и поэтому хранится только как GitHub Secret.
5. Owner запускает workflow `Staging backup` вручную один раз; TASK-081 затем
   проверяет свежий encrypted artifact, checksum, 14-day retention и access
   boundary. TASK-082 отдельно выполняет restore rehearsal.

`BACKUP_VPS_KNOWN_HOSTS` — проверенная строка public host key VPS, а не результат
автоматического `ssh-keyscan` во время backup. Это защищает job от MITM.

## Альтернатива, не выбранная Owner

### A — рекомендуемый

Перевести **только staging** на Supabase Pro. Это включает ежедневные database
backups с retention 7 дней. Отдельно создать Owner-controlled encrypted private
object-storage archive для зеркала `product-images` и дать агенту название
провайдера/bucket без секретов. После этого TASK-081 настроит и проверит daily
file mirror, свежий DB artifact, artifact list/retention и access boundary.

## Оставшийся безопасный доступ

Предыдущий VPS audit был read-only; его temporary key удалён. Поэтому agent не
восстанавливает старый доступ, не читает existing SSH keys и не подключается к
VPS до появления нового Owner-authorized backup user/key. Это не меняет legacy
bot и его SQLite data.

## Источники

- [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups)
  — plan eligibility, retention, Free-tier off-site dump guidance и исключение
  Storage objects из database backups.
- [Supabase automated GitHub Actions backups](https://supabase.com/docs/guides/deployment/ci/backups)
  — официальный вариант scheduled logical dumps.
