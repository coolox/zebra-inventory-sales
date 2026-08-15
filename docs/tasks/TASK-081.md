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
