# TASK-040 — Завершить staging Magic Link configuration

Статус: in_progress

## Цель

Настроить redirect URLs/templates staging и повторно проверить Owner/Seller sessions.

## Предполагаемые файлы

- `supabase/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/tasks/TASK-040.md`

## Зависимости

TASK-035, TASK-039.

## Критерии готовности

- Staging redirect URLs соответствуют callback route.
- Owner и invited Seller входят отдельными accounts.
- Unknown email не создаёт пользователя.
- Logout и membership guard работают.

## Тесты

- Manual Owner/Seller/unknown-email auth matrix.
- Expired link test.
- Mobile email-link smoke-test.

## Выполнено в staging (2026-08-13)

- В Supabase staging Site URL установлен на текущий временный Preview: `https://zebra-inventory-sales-mwq23cdh0-cooloxs-projects.vercel.app`.
- В redirect allow-list сохранены `http://localhost:3000/auth/callback` и `https://zebra-inventory-sales-mwq23cdh0-cooloxs-projects.vercel.app/auth/callback`.
- Проверен Magic Link email template: используется стандартный шаблон Supabase; изменять текст можно только после подключения custom SMTP, что не требуется для проверки redirect/session boundary.

## Остаётся для завершения

- Задать для текущего Vercel Preview `NEXT_PUBLIC_APP_MODE=live`, `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, затем передеплоить Preview.
- Провести Owner/Seller/unknown-email/expired-link/mobile auth matrix без раскрытия учётных данных в репозитории.
- Перед следующим Preview заменить временный Site URL и callback allow-list на его URL; localhost callback сохранить.
