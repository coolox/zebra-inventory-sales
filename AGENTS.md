# AGENTS.md — Zebra Retail

Этот файл обязателен к прочтению любым агентом или разработчиком перед работой с проектом.

## 1. Миссия проекта

Zebra Retail — система учёта товаров, приёмок и продаж для сети из трёх магазинов:

- одежда — Zebra Boutique;
- обувь — Zebra Steps;
- сумки — Zebra Bags.

Первый production MVP запускается только для магазина одежды. Обувь и сумки остаются в целевой архитектуре и подключаются после clothing pilot.

Владелец управляет всей сетью, магазинами и продавцами. Продавец работает только в разрешённых магазинах: ищет и принимает товар, оформляет продажи. Продажи всегда привязаны к продавцу и магазину.

## 2. Что читать в начале каждой новой сессии

Проект использует task-based workflow с минимальным контекстом. Читать строго в этом порядке:

1. `AGENTS.md` — правила работы и границы проекта.
2. `docs/PROJECT_STATUS.md` — единственный указатель, где остановились и какая TASK следующая.
3. Только выбранный `docs/tasks/TASK-NNN.md`.
4. `docs/ARCHITECTURE.md` — только если для текущей TASK требуется архитектурный контекст.
5. Только файлы, перечисленные в TASK; `docs/DECISIONS.md` читать дополнительно лишь когда задача зависит от продуктового решения.

`docs/ROADMAP.md` — активная карта пути до запуска, но не указатель текущей работы.
Указатель всегда берётся только из `docs/PROJECT_STATUS.md`. `docs/CURRENT_STATE.md`
остаётся историческим контекстом и не является обязательным для task-сессии.

Последнее прямое указание пользователя выше любой проектной документации. Если указание меняет продукт или архитектуру, после выполнения обновить соответствующие документы.

## 3. Источники правды

При конфликте использовать приоритет:

1. Последнее явное решение владельца продукта в чате.
2. Текущий `docs/tasks/TASK-NNN.md` и указатель `docs/PROJECT_STATUS.md`.
3. `docs/DECISIONS.md` со статусом `Принято`.
4. Фактический код, migrations и тесты.
5. `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/ROADMAP.md`.
6. `docs/CURRENT_STATE.md`, старые сообщения и предположения.

Не превращать предположение в принятое решение. Неясное решение фиксировать как `Ожидает ответа`.

## 4. Текущее техническое состояние

- Next.js 15.5.21, React 19, TypeScript, Tailwind CSS 4.1.18.
- Clothing MVP реализован как web/PWA с отдельными demo/live режимами.
- Supabase schema, RLS/RPC, Magic Link Auth, private Storage, atomic receipt/sale,
  cancellation/exchange, reporting и audit подготовлены migrations и частично
  подтверждены на staging.
- Frontend разделён на feature-модули, но `app/page.tsx` остаётся крупной composition
  boundary; broad refactor отложен после Clothing Pilot.
- Demo использует client persistence, live mode читает только Supabase и не подставляет
  mock-данные при ошибке.
- Production ещё не создан; Telegram-бот и legacy VPS не подключены к приложению.
- Текущий release path и актуальные test/CI gates находятся в `docs/PROJECT_STATUS.md`
  и `docs/ROADMAP.md`.

Подробности: `docs/CURRENT_STATE.md`.

## 5. Правила работы

Перед изменениями:

1. Прочитать документы из раздела 2.
2. Проверить, что команда владельца и поле `Следующая задача` в `PROJECT_STATUS.md`
   указывают на одну TASK. Если владелец явно выбрал другую TASK, проверить и
   зафиксировать изменение порядка до работы.
3. Проверить, что выбранная TASK имеет статус `pending` или `IN PROGRESS`, а её
   зависимости завершены.
4. При начале работы изменить её статус на `IN PROGRESS`, чтобы другой чат продолжил
   ту же задачу после прерывания.
5. Проверить `git status` и не затирать чужие изменения.
6. Работать только в границах одной TASK.
7. Если задача зависит от открытого продуктового решения, не выбирать скрытно — зафиксировать допущение или запросить решение.

Во время изменений:

- Не подключать demo к production VPS без отдельного разрешения.
- Не читать и не копировать `.env`, токены, ключи и персональные данные.
- Не хранить секреты в репозитории.
- Не менять работающего Telegram-бота без прямого запроса пользователя.
- Сохранять строгий визуальный язык: графит, фиолетовый акцент, серьёзный retail dashboard, без «игрушечного» UI.
- Разделять права владельца и продавца на уровне server-side авторизации, когда появится backend. Скрытие кнопки в UI не считается защитой.
- Денежные и складские операции проектировать как атомарные и аудируемые.

После существенной задачи:

1. Выполнить релевантные проверки; минимум `npm run build` для frontend.
2. Изменить статус текущего `docs/tasks/TASK-NNN.md` на `COMPLETED` и записать результат/evidence.
3. В `docs/PROJECT_STATUS.md` обновить `Последняя завершённая задача`, `Текущая задача`
   и `Команда для продолжения`.
4. В launch-таблице `docs/ROADMAP.md` отметить текущий шаг `DONE`, а ровно один следующий — `NEXT`.
5. Если принято решение — добавить запись в `docs/DECISIONS.md`.
6. Добавить краткую запись в `CHANGELOG.md`.
7. В финальном ответе написать `TASK-NNN: COMPLETED`, перечислить проверки и указать
   точную следующую команду владельца: `Выполни TASK-MMM`.
8. Затем остановиться. Не начинать TASK-MMM без новой команды пользователя.

## 6. Definition of Done

Задача завершена только когда:

- реализован заявленный пользовательский сценарий;
- учтены роли и ограничения магазина;
- обработаны пустые, ошибочные и граничные состояния;
- интерфейс работает на desktop и mobile;
- TypeScript и production build проходят;
- нет новых секретов и случайной связи с production;
- документация состояния и roadmap обновлена.

Для backend-задач дополнительно нужны миграции, проверки прав, транзакционность, тесты и план отката.

## 7. Правило передачи контекста

Нельзя рассчитывать на историю чата. Всё, что должен знать следующий агент, должно быть записано в репозитории.

В конце task-сессии актуальный контекст хранится в трёх местах:

1. `docs/tasks/TASK-NNN.md` — статус, границы и критерии конкретной задачи.
2. `docs/PROJECT_STATUS.md` — единственный текущий указатель: последняя завершённая,
   текущая/следующая TASK, команда продолжения и блокеры.
3. `docs/ROADMAP.md` — общий прогресс до запуска (`DONE` / `NEXT` / `WAITING` / `BLOCKED`).

Если чат прерван на `IN PROGRESS`, новый агент продолжает эту же TASK. Он не переводит
указатель дальше, пока критерии готовности не выполнены или владелец явно не изменил
приоритет.

## 8. Основные команды

```bash
npm install
npm run dev
npm run build
```

Рабочая директория содержит пробел в конце имени. Всегда заключать путь в кавычки при явном `cd`.

## 9. Codex project instructions

### Core workflow

This is a large project. Work in small isolated tasks.

Never attempt to implement the entire project or an entire large feature in one session.

Before starting work:

1. Read `docs/PROJECT_STATUS.md`.
2. Read ONLY the current task file from `docs/tasks/`.
3. Read `docs/ARCHITECTURE.md` only if architecture context is required.
4. Inspect only the source files directly relevant to the current task.

Do not load unrelated documentation or large parts of the repository without a specific reason.

### One task per session

Work on ONE task only.

Do not automatically start the next task after completing the current one.

If the current task is too large, stop and split it into smaller tasks before implementation.

### Implementation rules

For each task:

1. Understand the acceptance criteria.
2. Inspect the minimum necessary files.
3. Implement only what is required for the task.
4. Do not perform unrelated refactoring.
5. Do not change unrelated APIs.
6. Run relevant tests.
7. Fix errors caused by the implementation.
8. Verify the acceptance criteria.

### Completion protocol

When a task is complete:

1. Update its TASK file with status `COMPLETED`.
2. Record important implementation decisions if necessary.
3. Update `docs/PROJECT_STATUS.md`.
4. Set the next task in `PROJECT_STATUS.md`.
5. Give a short completion report containing:
   - what was changed;
   - files changed;
   - tests run;
   - result;
   - next task ID.
6. Then STOP.

Do not implement the next task until explicitly instructed.

### Context management

Keep context small.

Prefer targeted file reads over scanning the repository.

Do not repeatedly read large documents.

Do not read completed task files unless the current task depends on them.

Use `PROJECT_STATUS.md` as the primary handoff between sessions.

If previous implementation details are needed, inspect the actual code or the relevant task file instead of relying on chat history.

The repository is the source of truth, not the conversation history.
