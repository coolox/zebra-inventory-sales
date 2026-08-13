# Порядок ведения проекта

Обновлено: 2026-08-14

## Локальные режимы demo/live

Режим задаётся только явной переменной `NEXT_PUBLIC_APP_MODE`; наличие Supabase variables само по себе не включает live. Это сохраняет один и тот же первый HTML tree для SSR и client hydration.

```bash
# Demo: http://localhost:3000, artifacts в .next-demo
npm run dev:demo

# Live: http://localhost:3001, artifacts в .next-live
npm run dev:live
```

Не запускать оба режима командой `npm run dev`: она намеренно является alias для безопасного demo. Для production-like проверки использовать `npm run build:demo`/`npm run start:demo` или соответствующую пару `:live` — build и start всегда должны быть одного режима.

Chrome debugging banner и extension UI не являются hydration error. Проверять нужно console messages приложения: Recoverable Hydration Error, `Hydration failed` или `Text content does not match`.

## 1. Начало любой сессии

1. Прочитать `AGENTS.md`.
2. Прочитать `CURRENT_STATE.md`, `DECISIONS.md`, `ROADMAP.md`.
3. Проверить состояние файлов и незавершённые изменения.
4. Сформулировать текущую цель и определить её этап roadmap.
5. Проверить, не зависит ли задача от решения со статусом `Ожидает ответа`.

## 2. Планирование задачи

Для задачи определить:

- пользовательский результат;
- что входит и не входит в scope;
- затронутые роли и магазины;
- модель данных и риски;
- критерии приёмки;
- проверки;
- документацию, которую нужно обновить.

Большую функцию разбивать вертикально: один законченный пользовательский поток от UI до хранения и теста, а не сначала весь UI, потом весь backend.

## 3. Реализация

- Сохранять существующее поведение, если изменение не согласовано.
- Избегать преждевременной инфраструктуры и пустых abstraction layers.
- Критические операции покрывать доменными и integration tests.
- Не использовать production credentials или реальные данные в local/staging.
- Миграции делать forward-only с отдельным rollback/restore plan для релиза.

## 4. Проверка

Frontend minimum:

- TypeScript;
- production build;
- desktop/mobile visual check;
- роли owner/seller;
- loading, empty, error и boundary states;
- keyboard/focus basics.

Backend minimum после его появления:

- schema migration test;
- authorization tests;
- transaction/concurrency tests для sale/receipt;
- idempotency test;
- backup/restore check перед production launch.

## 5. Завершение сессии

Обновить:

- `CURRENT_STATE.md` — факт результата и следующий шаг;
- `ROADMAP.md` — checklist/status;
- `DECISIONS.md` — новые решения;
- `QUESTIONS.md` — полученные ответы и новые блокеры;
- `CHANGELOG.md` — краткая запись.

Финальный handoff должен содержать:

```text
Цель:
Сделано:
Проверено:
Не сделано:
Следующий шаг:
Блокеры/решения:
```

## 6. Управление scope

Новая идея не должна незаметно расширять MVP. Она попадает в один из списков:

- текущий этап;
- следующий этап;
- post-MVP backlog;
- отклонено.

Перестановка приоритетов фиксируется в roadmap и changelog.

## 7. Работа с VPS и внешними системами

- Любой доступ начинается с чёткого scope и read-only исследования.
- Изменения, перезапуск сервиса, database write или deployment требуют отдельного разрешения.
- Никогда не выводить секреты в чат, логи или документацию.
- Перед миграцией создать backup и проверить, что он читается.
- После временного доступа удалить временные ключи и зафиксировать cleanup.
