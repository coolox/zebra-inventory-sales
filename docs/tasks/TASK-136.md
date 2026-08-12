# TASK-136 — Исправить PWA preview findings и закрыть gate

Статус: pending

## Цель

Исправить блокирующие дефекты mobile preview и зафиксировать готовность вернуться к основной разработке.

## Предполагаемые файлы

- точечные PWA/UI files по результатам TASK-135
- `docs/PWA_MOBILE_CHECKLIST.md`
- `docs/PROJECT_STATUS.md`
- `CHANGELOG.md`

## Зависимости

TASK-135.

## Критерии готовности

- Все install/launch/navigation/data-loss blockers исправлены и перепроверены.
- Неблокирующие findings вынесены в отдельные TASK с приоритетом.
- HTTPS preview обновлён и повторный owner smoke пройден.
- В `PROJECT_STATUS.md` снята PWA pause и следующей задачей снова указана TASK-060.

## Тесты

- Targeted regression tests найденных дефектов.
- Typecheck, full unit/component suite и production build.
- Повторный install/standalone smoke на затронутом устройстве.

