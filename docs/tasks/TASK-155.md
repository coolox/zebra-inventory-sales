# TASK-155 — Восстановить Seller invitation в staging Preview

Статус: COMPLETED

Источник: feedback Owner во время walkthrough TASK-086, 2026-08-17.

Evidence: Owner iPhone screenshot показывает ошибку
`This service is temporarily unavailable.` после отправки Seller invitation.
Screenshot содержит персональные контактные данные и не копируется в репозиторий.

## Диагноз

Проблема не связана с Turkish-именем. `parseSellerInvite` принимает любой непустой
Unicode `fullName` длиной до 120 символов, поэтому имя с `ğ` проходит validation.

Read-only `vercel env ls` для текущего staging project подтвердил, что Preview scope
содержит public app/Supabase configuration, но не содержит server-only
`SUPABASE_SERVICE_ROLE_KEY`. `app/api/sellers/invite/route.ts` вызывает
`createAdminClient()` после успешных input/auth/Owner checks; при отсутствии этой
переменной route возвращает generic `503 unavailable`. Ошибка возникает до
`inviteUserByEmail`, SMTP delivery и `activate_invited_seller` RPC.

Значения environment variables, project identifiers и contact data не читались и
не записывались.

## Ожидаемый результат

- Seller invitation работает на утверждённом staging Preview с server-only
  credential, scoped настолько узко, насколько позволяет выбранный staging flow.
- Секрет не попадает в browser bundle, Git, task files, screenshots или chat.
- Unicode full names, включая Turkish characters, сохраняются без искажения.
- Owner получает корректное локализованное success/error состояние; безопасное
  server-side evidence позволяет отличить configuration failure от Auth/SMTP error.
- Existing-account replay и store/Owner authorization продолжают работать.

## План проверки при реализации

1. Проверить presence/scope server-only credential без чтения значения.
2. Redeploy утверждённый staging Preview после configuration change.
3. Отправить invitation на controlled test identity с Turkish Unicode name.
4. Подтвердить delivery, membership и login; не публиковать email/Magic Link.
5. Повторить unauthorized/Seller denial и idempotent existing-user cases.
6. Выполнить relevant route/component tests и `npm run build`.

## Ограничение

Не добавлять или запрашивать secret и не начинать исправление, пока Owner не сообщит,
что сбор проблем TASK-086 завершён.

## Прогресс — 2026-08-18

- Owner подтвердил окончание сбора feedback и запустил TASK-155.
- Read-only Vercel environment listing повторно подтвердил: Preview имеет public
  Supabase configuration, но не содержит `SUPABASE_SERVICE_ROLE_KEY`; значение
  существующих переменных не читалось.
- Route теперь отправляет в opt-in redacted server observability только безопасный
  этап сбоя (`seller.invite.configuration/admin_client` или `seller.invite.auth`),
  при этом клиент продолжает получать общий `unavailable` без деталей конфигурации.
- Локально прошли targeted Vitest (8 assertions), TypeScript и `npm run build:live`
  (успешно; только существующие lint warnings).

### Ожидаемое действие Owner (без передачи секрета в чат)

В Vercel project staging добавить `SUPABASE_SERVICE_ROLE_KEY` как Sensitive variable
только для `Preview`, используя service-role credential именно staging Supabase
project. Не добавлять переменную в Git, `.env` или browser-visible `NEXT_PUBLIC_*`
scope. После сохранения сообщить только «готово»; затем задача продолжит redeploy и
контролируемую invitation acceptance.

## Результат — 2026-08-18

Owner добавил credential напрямую в Vercel, а read-only listing подтвердил Sensitive
`SUPABASE_SERVICE_ROLE_KEY` исключительно в Preview. Server-side route сохраняет
generic unavailable state для клиента, но пишет redacted diagnostic stage в opt-in
observability. Full Vitest 83 files / 201 tests, lint без errors и demo/live builds
прошли. По решению Owner controlled invitation, delivery, membership/login, Seller
denial и existing-account replay выполняются один раз после общего remediation
Preview вместе с TASK-157—TASK-163; Magic Link и контактные данные до того не
используются.
