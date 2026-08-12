# TASK-008 — Подключить mixed-payment UI к live sale RPC

Статус: COMPLETED

## Цель

Отправлять проверенные payment lines из Sale Flow в native-currency RPC и обновлять workspace после успеха.

## Предполагаемые файлы

- `features/sales/data/confirm-live-sale.ts`
- `features/sales/model/types.ts`
- `app/page.tsx`

## Зависимости

TASK-005, TASK-006, TASK-007.

## Критерии готовности

- Live sale вызывает mixed-payment RPC.
- Demo и live используют один draft contract.
- После успеха inventory, sales и activity обновляются.
- Повторная отправка защищена idempotency key.

## Тесты

- Integration test client payload shape.
- Staging smoke-test Cash EUR + Card USD.
- `npm run build`.

## Результат

- Sale Flow отправляет единый payment draft в native-currency RPC; live mode загружает business-date rates и обновляет workspace после успешной операции.
- Клиентский integration-тест фиксирует форму RPC payload. Staging smoke-test ожидает разрешения на TASK-002.
