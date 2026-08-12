# TASK-123 — Устранить hydration mismatch при локальной отладке

Статус: pending

> Частично устранено 2026-08-11: `Home` больше не выбирает live tree до hydration, поэтому server/browser runtime mode не дают разные первые HTML trees. Для полного закрытия всё ещё нужны clean demo/live browser smoke, console assertion и документированные раздельные dev-команды.

## Цель

Исключить Recoverable Hydration Error при запуске demo/live development sessions и сделать режим приложения одинаковым для server render и client hydration.

## Предполагаемые файлы

- `next.config.ts`
- `features/workspace/model/app-mode.ts`
- `package.json`
- `docs/WORKFLOW.md`

## Зависимости

Нет.

## Критерии готовности

- Demo и live dev servers не используют конфликтующий build output.
- App mode не различается между SSR и первым client render.
- Одна документированная команда запускает каждый режим безопасно.
- Chrome debugging banner/extension не считается частью production UI; реальная hydration ошибка диагностируется отдельно от browser tooling.

## Тесты

- Чистый single-server demo/live smoke без hydration warnings.
- Последовательный mode-switch smoke.
- Browser console assertion на отсутствие hydration mismatch.
