# TASK-203 — Сделать Android PWA installation проверяемой

Статус: PAUSED

2026-08-31: Code и automated checks готовы; publication/physical Android
acceptance ждут отдельного разрешения Owner. Owner переключил приоритет на
следующий pilot defect TASK-205.

## Источник

2026-08-25 Owner сообщил: приложение открывается в Android Chrome, но не удаётся
установить его как приложение.

Owner evidence уточняет симптом: Chrome shows **"Install and create shortcut"**,
but the shortcut dialog renders a generic `V` icon instead of Zebra branding; the
Home Screen entry does not launch the app. No private screenshot, URL, account or
device identifier is stored in the repository.

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

## Реализация и текущая проверка — 2026-08-31

- Добавлен root-scoped `/sw.js`, регистрируемый только в production. Он выполняет
  только `fetch(event.request)` и ничего не сохраняет: offline inventory/sale
  semantics не заявляются, а stale data не могут быть показаны как актуальные.
- Существующие explicit manifest, PNG и maskable icons сохранены; worker делает
  Android Chrome installability явной, а не только Home Screen shortcut.
- Unit checks manifest/registration: 2 files / 3 tests passed.
- Production Playwright PWA smoke: 3/3 desktop/tablet/mobile passed; проверяет
  manifest, PNG MIME, `/sw.js` response и active registration.
- `npm run build:live` — passed; остаются только прежние unrelated warnings в
  `app/page.tsx`.

Кодовая часть готова, но TASK остаётся `IN PROGRESS` до publication и физического
Android Chrome Home Screen → Magic Link → read-only inventory acceptance Owner.
