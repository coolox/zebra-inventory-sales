# TASK-203 — Сделать Android PWA installation проверяемой

Статус: pending

## Источник

2026-08-25 Owner сообщил: приложение открывается в Android Chrome, но не удаётся
установить его как приложение.

## Граница

- Текущий manifest содержит standalone display и Android icons.
- В production code не найден service worker registration/worker. Поэтому Chrome
  может предложить только Home Screen shortcut и не обязан показывать full
  "Install app" flow.
- До исправления это P2 pilot observation: web usage in Chrome remains available.

## Цель

Сделать Chrome Android installability и Home Screen launch явными, проверяемыми и
документированными, не меняя Auth, live data или offline guarantees без отдельного
решения Owner.

## Критерии готовности

- На supported Android Chrome доступен корректный install/add-to-home-screen путь.
- После запуска с Home Screen app отображает standalone shell и проходит Magic Link
  login/live data smoke.
- Offline semantics явно определены; stale inventory/sale data не выдаются за
  актуальные.
- Android device evidence и fallback instruction записаны без личных данных.

## Тесты

- Production manifest/icons/service-worker response check.
- Android Chrome install + Home Screen launch.
- Live login and one read-only inventory smoke after installed launch.
