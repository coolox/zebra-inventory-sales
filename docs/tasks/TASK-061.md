# TASK-061 — Провести desktop/tablet/mobile browser QA

Статус: pending

## Цель

Зафиксировать visual и interaction readiness на основных viewport и pilot devices.

## Предполагаемые файлы

- `docs/UI_REVIEW.md`
- `docs/PROJECT_STATUS.md`
- точечные UI files только для найденных дефектов

## Зависимости

TASK-058, TASK-059, TASK-060.

## Критерии готовности

- Проверены desktop, tablet, iPhone portrait и Android portrait.
- Sale, receipt, catalog, themes, locale и navigation имеют evidence.
- Новые дефекты оформлены отдельными TASK, а не скрыты внутри QA.

## Тесты

- Playwright visual/interaction matrix.
- Manual iPhone/Android pilot-device checklist.
- Production build after any fixes.

