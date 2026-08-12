# TASK-040 — Завершить staging Magic Link configuration

Статус: pending

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

