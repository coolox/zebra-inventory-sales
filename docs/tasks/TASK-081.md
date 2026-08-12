# TASK-081 — Настроить автоматические backups

Статус: pending

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

