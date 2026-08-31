# TASK-207 — Исправить зависающий Logout и смену Seller → Owner

Статус: COMPLETED

Создано: 2026-08-31 из недельного bug intake Owner во время TASK-088.

## Наблюдение Owner

- После работы под Seller Owner попытался выйти и войти под другим личным Owner
  account.
- Нажатие Logout визуально не завершило сессию.
- После попытки входа Owner workspace не показывал данные.
- Реальные email, Magic Links, session tokens и identifiers в evidence не писать.

## Цель

Сделать Logout гарантированным и понятным: серверная и браузерная auth session
очищаются, повторные нажатия блокируются, а пользователь всегда попадает на
`/login` и может войти под другим разрешённым account. Не подменять ошибку live
данных demo/mock-состоянием.

## Границы

- Добавить same-origin server logout boundary, очищающий Supabase SSR cookies.
- Клиентский Logout должен иметь pending state и bounded fallback, чтобы network
  failure не оставлял кнопку без реакции.
- Применить тот же flow на workspace и access-denied surface.
- Не менять production users, memberships, Auth URL, database или секреты.
- Не диагностировать конкретный личный account по email в repository.

## Критерии готовности

- Logout вызывает server-side sign-out и после успеха заменяет history на `/login`.
- При server/network error browser cleanup и redirect всё равно выполняются.
- Пока идёт выход, повторное нажатие невозможно и control имеет понятный label.
- После logout middleware не возвращает пользователя в workspace со старой сессией.
- Route/client regression tests, demo/live build и `git diff --check` проходят.
- Физическая проверка Seller logout → Owner fresh Magic Link остаётся отдельным
  Owner acceptance шагом без раскрытия identity.

## Зависимость и возврат

Bug найден в TASK-088. После completion pointer возвращается к следующему пункту
недельного intake либо к TASK-088, если список исчерпан.

## Реализация и evidence — 2026-08-31

- Добавлен `POST /api/logout`: server-side Supabase sign-out очищает SSR auth
  cookies и возвращает только `no-store` response.
- Общий client flow одновременно запускает server/browser cleanup, ограничивает
  ожидание четырьмя секундами и через `location.replace()` всегда открывает
  чистый `/login`, даже если auth/network cleanup вернул ошибку или завис.
- Workspace и Access Denied используют один flow; кнопки имеют localized pending
  label, `aria-busy`, disabled state и не допускают повторных logout requests.
- Targeted Vitest: 3 files / 6 tests passed, включая success, обе ошибки и
  stalled-request timeout.
- `npm run build:demo` — passed.
- `npm run build:live` — passed.
- `git diff --check` — passed.
- Остались только прежние unrelated warnings в `app/page.tsx`; production Auth,
  users, memberships, database и secrets не изменялись.
- Физическая Seller → Logout → Owner Magic Link проверка переносится обратно в
  TASK-088 и выполняется после consolidated remediation publication.
