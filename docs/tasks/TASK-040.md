# TASK-040 — Завершить staging Magic Link configuration

Статус: COMPLETED

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

## Выполнено в staging (2026-08-13—14)

- В Vercel Preview заданы `NEXT_PUBLIC_APP_MODE`, `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; значения не фиксируются в репозитории.
- В Vercel исправлены staging build settings: `npm run build:live` и output directory `.next-live`. Новый Preview успешно собран.
- Для Preview отключена Vercel Authentication: Magic Link и mobile users теперь не должны попадать на Vercel login. Внешняя проверка без Vercel-сессии вернула HTTP 200 для `/login`.
- В Supabase staging Site URL установлен на branch Preview: `https://zebra-inventory-sales-git-review-task-060-077-cooloxs-projects.vercel.app`.
- В redirect allow-list сохранены `http://localhost:3000/auth/callback` и `https://zebra-inventory-sales-git-review-task-060-077-cooloxs-projects.vercel.app/auth/callback`.
- Без авторизации подтверждён live login screen Preview: `Sign in securely` и отправка Magic Link; demo UI не подставляется.
- Проверен Magic Link email template: используется стандартный шаблон Supabase; изменять текст можно только после подключения custom SMTP, что не требуется для проверки redirect/session boundary.

## Подтверждено владельцем (2026-08-14)

- Unknown email получает безопасную ошибку и не создаёт доступ.
- Owner успешно входит по Magic Link на телефоне и после logout может запросить новую ссылку.
- Invited Seller успешно входит отдельным account и сохраняет role boundary.
- Уже использованная ссылка не даёт повторный вход; refresh после logout не открывает магазин.
- После отключения Vercel Authentication Magic Link больше не перенаправляет на Vercel login.

## Для следующего Preview

- Заменить Site URL и callback allow-list на URL нового Preview; localhost callback сохранить.
