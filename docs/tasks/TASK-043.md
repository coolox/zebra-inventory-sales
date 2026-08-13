# TASK-043 — Добавить server validation и rate limiting

Статус: COMPLETED

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

## Результат (2026-08-14)

- Создан единый runtime validation boundary для Seller invite/status: принимает только plain-object payload, UUID identifiers, допустимые статусы и ограниченные нормализованные text fields; неизвестные поля не проходят в privileged action.
- Invite, Seller access change и auth-sensitive session endpoint используют явные in-memory policies rate limit. Ключи scopes разделены, platform forwarded address имеет приоритет и не логируется.
- Server errors возвращаются как безопасный domain contract `{ error, code }`; provider/RPC messages и входные PII не отдаются клиенту и не логируются.
- Добавлены validation, limiter и API malformed/rate-limit tests. Полный suite и production build проходят; staging/production не изменялись.
