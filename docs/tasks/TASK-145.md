# TASK-145 — Зафиксировать Clothing Pilot Release Candidate

Статус: IN PROGRESS

## Цель

Создать один воспроизводимый RC commit в `main`, из которого будут развернуты staging и production.

## Зависимости

TASK-117, TASK-142, TASK-143, TASK-144.

## Критерии готовности

- Feature freeze и исключённый post-launch scope зафиксированы.
- Все release-gate commands зелёные на одном commit.
- Текущая review-ветка прошла review и влита в `main` без потери миграций.
- RC commit SHA записан в `PROJECT_STATUS.md` и deployment docs.
- Нет tracked/untracked release artifacts, secrets или незакоммиченных изменений.
- Любое изменение после RC создаёт новый RC и повторяет затронутые gates.

## Тесты

- GitHub CI Frontend + Local Supabase.
- Migration inventory/diff review.
- `git status`, commit/branch verification и secret scan.
