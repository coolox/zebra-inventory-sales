# TASK-202 — Создать production backup checkpoint

Статус: IN PROGRESS

## Цель

До первого production migration/deploy создать изолированный encrypted backup
checkpoint production Postgres и private `product-images`, с checksum и
14-day retention на Owner-controlled VPS.

## Зависимости

TASK-081, TASK-082, TASK-149.

## Границы

- Не читать, не записывать и не выводить secrets, database URLs, private keys,
  age identity или S3 credentials.
- Не изменять staging backup workflow, storage или archive path.
- Workflow создаёт только encrypted artifact на отдельном `production` VPS path;
  он не применяет migrations, не деплоит Vercel и не создаёт Auth users/pilot data.

## Критерии готовности

- Есть отдельный manual-only GitHub Actions workflow `Production backup checkpoint`.
- Production использует только префиксованные `PRODUCTION_*` secrets, поэтому
  staging credentials нельзя подставить по умолчанию.
- Artifact имя и VPS path изолированы как `production-YYYY-MM-DD.tar.gz.age` и
  `zebra-retail/production`; checksum проверяется на VPS до promotion в daily.
- Owner вводит secrets вне Git, вручную запускает workflow и подтверждает успешный
  run ID, timestamp и checksum evidence без передачи secret values.
- Перед TASK-150 release record получает ссылку на свежий checkpoint и Owner
  подтверждает rollback authority.

## Файлы

- `.github/workflows/production-backup.yml`
- `scripts/backup/run-staging-backup.sh`
- `scripts/backup/run-production-backup.sh`
- `docs/operations/PRODUCTION_BACKUP_CHECKPOINT.md`
- `docs/operations/GO_NO_GO.md`
- `docs/PROJECT_STATUS.md`
- `docs/ROADMAP.md`
- `CHANGELOG.md`

## Проверки

- `bash -n scripts/backup/run-staging-backup.sh scripts/backup/run-production-backup.sh`
- Проверка workflow secret names и production-only path без их значений.
- Owner-triggered GitHub Actions checkpoint с checksum evidence.

## Выполнено в репозитории — 2026-08-22

- Добавлен manual-only workflow с отдельными `PRODUCTION_*` secrets и новым
  production wrapper.
- Общий backup runner теперь принимает только `staging` или `production` scope;
  staging остаётся default и сохраняет прежний path/name.
- Создание actual checkpoint ожидает Owner secret setup и ручной run: их значения
  не доступны агенту и не могут быть безопасно сгенерированы.

## Run attempt — 2026-08-23

Manual GitHub Actions run `32605857718` verified that all 14 secret names resolve,
but stopped before any dump, Storage, VPS or migration operation: the production
wrapper executed a non-executable tracked script and received exit code 126. The
wrapper now invokes it explicitly through `bash`; rerun is required after publishing
that isolated fix.
