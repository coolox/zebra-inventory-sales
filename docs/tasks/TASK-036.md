# TASK-036 — Подключить Owner invite Seller UI

Статус: COMPLETED

## Цель

Заменить mock-добавление продавца реальной формой invite в live mode.

## Предполагаемые файлы

- `features/sellers/ui/invite-seller-form.tsx`
- `features/sellers/data/invite-seller.ts`
- `app/page.tsx`

## Зависимости

TASK-035.

## Критерии готовности

- Форма требует full name, email и phone.
- Live mode отправляет invite, demo сохраняет локально через adapter.
- Success/error/loading states локализованы.

## Тесты

- Component validation/submit tests.
- Staging Owner invite smoke-test.
- `npm run build`.

## Результат

- Live Owner видит форму с обязательными Full name, Email и Phone; demo продолжает использовать локальный adapter.
- Отображаются локализованные состояния validation, sending, success и error.
- Staging smoke пройден 2026-08-12: live UI подтвердил отправку invite email для Taylan Zor.
