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
