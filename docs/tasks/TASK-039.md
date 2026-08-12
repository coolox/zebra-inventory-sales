# TASK-039 — Локализовать login и access-denied

Статус: COMPLETED

## Цель

Завершить English/Turkish покрытие входа, callback errors и отказа в доступе.

## Предполагаемые файлы

- `app/login/page.tsx`
- `app/access-denied/page.tsx`
- `app/auth/callback/route.ts`
- `lib/i18n.ts`

## Зависимости

Нет.

## Критерии готовности

- Все пользовательские auth строки имеют en/tr варианты.
- Locale сохраняется до входа и после session load.
- Ошибки не раскрывают sensitive details.

## Тесты

- Component/render tests обеих locales.
- Invalid/expired link smoke-test.
- `npm run build`.

## Результат

- Login и Access Denied имеют переключатель English/Turkish; выбор сохраняется в localStorage до входа и после callback/session load.
- Callback переносит только разрешённый locale в redirect и отдаёт безопасные `missing_code`/`invalid_link` сообщения без технических деталей Auth.
- Component tests покрывают English/Turkish render; local HTTP smoke подтвердил redirect отсутствующего кода на `/login?error=missing_code&locale=tr`.
