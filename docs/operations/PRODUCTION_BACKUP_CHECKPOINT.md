# Production backup checkpoint — Clothing Pilot

Статус: **готов к Owner secret setup и manual run (TASK-202)**.

Этот документ не содержит значений secrets, URLs, ключей, VPS endpoints или
персональных контактов.

## Что создаёт checkpoint

GitHub Actions workflow **Production backup checkpoint** запускается только вручную.
Он выгружает production database roles/schema/data и зеркало private
`product-images`, собирает deterministic archive, шифрует его `age`, проверяет
`SHA256SUMS` на Owner VPS и сохраняет только в:

```text
<PRODUCTION_BACKUP_VPS_PATH>/zebra-retail/production/daily/YYYY-MM-DD/
```

Artifact имеет вид `production-YYYY-MM-DD.tar.gz.age`. Staging path не читается и
не изменяется. Retention — 14 daily copies; запускать checkpoint с повторным
timestamp в тот же UTC day нельзя, чтобы не перезаписать accepted evidence.

## GitHub Actions secrets

В repository **Settings → Secrets and variables → Actions** добавить эти exact
names, заполняя значения исключительно из production Supabase / Owner VPS:

```text
PRODUCTION_SUPABASE_DB_URL
PRODUCTION_SUPABASE_DB_POOLER_HOST
PRODUCTION_SUPABASE_DB_POOLER_PORT
PRODUCTION_SUPABASE_STORAGE_S3_ENDPOINT
PRODUCTION_SUPABASE_STORAGE_S3_REGION
PRODUCTION_SUPABASE_STORAGE_S3_ACCESS_KEY_ID
PRODUCTION_SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY
PRODUCTION_BACKUP_VPS_HOST
PRODUCTION_BACKUP_VPS_PORT
PRODUCTION_BACKUP_VPS_USER
PRODUCTION_BACKUP_VPS_PATH
PRODUCTION_BACKUP_VPS_SSH_PRIVATE_KEY
PRODUCTION_BACKUP_VPS_KNOWN_HOSTS
PRODUCTION_BACKUP_AGE_RECIPIENT
```

Do not reuse unprefixed staging secrets. The production VPS destination must be
writable by the designated backup user but isolated from staging; the `age`
recipient must have a second private-identity copy held outside the workstation.

## Owner run and evidence

1. In GitHub, open **Actions → Production backup checkpoint → Run workflow** and
   run it on the release branch/tag containing TASK-202.
2. Wait for the `Encrypted production database and product-images checkpoint` job
   to complete successfully. Never paste its secret values or logs into chat.
3. Record only the run ID, UTC timestamp, artifact filename, SHA-256 match and
   the confirmation that the Owner controls rollback authority.
4. Tell the agent those non-sensitive evidence fields. The agent then updates
   TASK-202 and the release record before TASK-149 can be resumed.

## Failure rule

Any missing secret, empty dump, failed encryption, checksum mismatch, wrong path,
or artifact-name collision is immediate `NO-GO`. Do not retry a partially created
checkpoint by overwriting it; inspect it through the Owner-controlled channel and
start a new dated checkpoint only after the cause is resolved.
