# TASK-081 — Настроить автоматические backups

Статус: BLOCKED — OWNER DECISION

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
- Создан [backup policy](../operations/BACKUP.md) с required retention,
  access boundary и двумя выполнимыми вариантами.
- Production не открывался и не изменялся. Secrets не читались.

Для completion Owner должен выбрать вариант A или B из `BACKUP.md` и определить
private archive provider/bucket. Без этого нельзя включить schedule, создать
fresh artifact или подтвердить retention/access control без скрытого выбора
платёжного плана и внешнего хранилища.
