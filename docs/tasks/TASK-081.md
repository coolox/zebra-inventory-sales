# TASK-081 — Настроить автоматические backups

Статус: IN PROGRESS

## Цель

Определить и включить backup database и product images с retention для pilot.

## Предполагаемые файлы

- `docs/operations/BACKUP.md`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-079.

## Критерии готовности

- Database и Storage backup schedule/retention зафиксированы.
- Ответственные и место хранения определены.
- Backup не содержит доступных из git credentials.

## Тесты

- Проверка создания свежего backup.
- Проверка списка/retention backup artifacts.
- Access-control review.

## Проверка и блокер — 2026-08-15

- Staging Supabase Dashboard подтверждает Free Plan: scheduled database backups
  и artifacts недоступны; Pro даёт daily database backups с retention 7 days.
- Нативный database backup не содержит private Storage objects, поэтому
  `product-images` требует отдельного encrypted off-site mirror.
- Owner выбрал Plan B: encrypted off-site backups на свой VPS. Добавлены
  scheduled GitHub Actions workflow и VPS bootstrap для отдельного
  non-privileged backup user; secrets в репозиторий не попадают.
- Production не открывался и не изменялся. Secrets не читались.

Для completion нужен новый Owner-authorized backup SSH key/user, GitHub Secrets
и один manual workflow run. Предыдущий read-only VPS audit key удалён; agent не
восстанавливает старый доступ и не меняет legacy bot. После первого run будут
проверены fresh encrypted artifact, checksum, 14-day retention и access control.

## VPS access check — 2026-08-15

- После прямого разрешения Owner выполнена только read-only проверка локального
  SSH profile `contabo`: это default unresolved hostname, не рабочий configured
  alias. `ssh ... contabo 'id -un'` остановилась до подключения с DNS error.
- SSH private keys, passwords, `.env` и VPS files не читались; remote mutation
  не выполнялась.
- Для реального VPS bootstrap нужен точный SSH hostname/IP (и port, если не 22)
  либо рабочий Host alias. Это несекретные данные; private key/password в чат
  передавать не нужно.

## VPS endpoint check — 2026-08-15

- Owner-authorized Contabo panel confirmed the running Linux VPS endpoint and
  default SSH port. The endpoint is intentionally not copied into Git or project
  documents; it belongs only in the `BACKUP_VPS_HOST` GitHub Secret.
- A read-only SSH check reached host-key verification, so network routing is
  available. The machine has no previously trusted ED25519 host key, therefore
  no connection or mutation was made under trust-on-first-use.
- Before bootstrap, verify and pin the VPS ED25519 fingerprint through a trusted
  Contabo console or another independent access path. Only then create the
  isolated backup user; legacy bot files, service and data remain out of scope.

## Host identity and authorization check — 2026-08-15

- Owner supplied an out-of-band ED25519 fingerprint. A direct public-key scan
  matched it exactly, so the VPS host identity is verified.
- The resulting pinned, read-only SSH login was rejected with
  `Permission denied (publickey,password)`. No password was requested or tried,
  no private key was inspected, and no VPS mutation occurred.
- Completion now needs the Owner to make a temporary, Owner-controlled SSH
  authorization path available from this workstation. Once access is confirmed,
  bootstrap will create the isolated `zebra-backup` user and remove any temporary
  root authorization before the GitHub private key is configured.

## Isolated VPS archive account — 2026-08-15

- Owner authorized the temporary root path after the host identity check. Agent
  created `zebra-backup` (uid/gid 1000), without sudo or supplementary groups.
- `/home/zebra-backup`, `/srv/zebra-backups` and its staging `daily`/`incoming`
  directories are owned by that user with mode `700`; its `authorized_keys` is
  mode `600`. Existing bot files, SQLite data and service were not read or
  changed.
- The public GitHub backup key is deliberately still absent from the new account:
  agent does not read or copy key material. Owner must install the already-created
  public key locally, then agent will verify unprivileged login and remove the
  temporary root authorization.

## Backup key cutover — 2026-08-15

- Owner installed the existing public backup key into `zebra-backup` locally;
  agent verified SSH login with only that account group, writable archive inbox
  and no write access to `/root`.
- Exactly one temporary `zebra-staging-backup` root authorization was found and
  removed after that successful verification. The archive account remains the
  only configured access path for the backup job.
- VPS side is ready. Remaining TASK-081 work: add the six VPS GitHub Secret
  values (including the Owner-entered private key), publish the already-reviewed
  workflow with explicit deployment approval, run it once and inspect artifact,
  checksum, retention and access boundary.

## GitHub VPS secret progress — 2026-08-15

- Agent added the four non-key repository secret names/values required by the
  workflow: `BACKUP_VPS_HOST`, `BACKUP_VPS_PORT`, `BACKUP_VPS_USER` and
  `BACKUP_VPS_PATH`. Existing secret values were not opened.
- Owner must still enter the private SSH key only in
  `BACKUP_VPS_SSH_PRIVATE_KEY` and install the independently pinned ED25519
  known-hosts line in `BACKUP_VPS_KNOWN_HOSTS`. No key material is copied into
  project files or chat.

## GitHub secret set complete — 2026-08-15

- Owner entered `BACKUP_VPS_SSH_PRIVATE_KEY`. Agent installed the independently
  fingerprint-verified public ED25519 line as `BACKUP_VPS_KNOWN_HOSTS` and
  confirmed all twelve required repository secret names are present.
- Secret values were never opened after saving. The prepared workflow is still
  local only; its publication awaits separate Owner approval because a push to
  `main` triggers a new Vercel production deployment.

## First manual workflow evidence — 2026-08-15

- Owner approved publication; `main` was pushed and GitHub Actions run
  `Staging backup #1` was manually started from the published workflow.
- The job failed before any archive/artifact was created. Its redacted log shows
  that `SUPABASE_DB_URL` resolves to the direct IPv6 database host while hosted
  GitHub runners lack IPv6 connectivity. VPS and Storage stages were not reached.
- Required corrective action: Owner replaces only `SUPABASE_DB_URL` with the
  staging project's **IPv4 Transaction Pooler** connection string from Supabase
  Dashboard → Connect, retaining the existing database password locally. Do not
  paste the URL/password in chat. Then rerun the same workflow; no code or VPS
  change is currently indicated.

## IPv4 runner compatibility fix — 2026-08-15

- Owner requested an agent-side fix without exposing the database password.
  Workflow now supplies the confirmed staging Shared Transaction Pooler host and
  port as non-secret configuration. The script transforms the existing direct
  `SUPABASE_DB_URL` only in runner memory: it preserves the hidden password,
  switches hostname/port and uses the required `postgres.<project-ref>` user.
- The transformed URL is written mode `600` inside the task temp directory,
  never printed or committed. No Secret replacement is needed.
- `bash -n`, workflow YAML parse, pooler-URL fixture assertion, missing-config
  guard and `git diff --check` pass. Fix awaits a push and rerun of Staging
  backup; no artifact exists yet.
