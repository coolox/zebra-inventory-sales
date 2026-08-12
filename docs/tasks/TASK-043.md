# TASK-043 — Добавить server validation и rate limiting

Статус: pending

## Цель

Защитить auth/invite и write endpoints единым validation boundary и ограничением частоты.

## Предполагаемые файлы

- `lib/validation/**`
- `lib/rate-limit/**`
- `app/api/**/route.ts`

## Зависимости

TASK-035, TASK-037.

## Критерии готовности

- External input валидируется до privileged action.
- Rate limits определены для invite/auth-sensitive routes.
- Ошибки имеют безопасный domain format.
- No secret/client PII logging.

## Тесты

- Unit validation tests.
- Rate-limit boundary tests.
- API malformed payload tests.

