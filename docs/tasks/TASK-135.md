# TASK-135 — Проверить установку PWA на телефоне

Статус: pending

## Цель

Подтвердить реальную установку и standalone‑поведение Zebra Retail с HTTPS preview.

## Предполагаемые файлы

- `docs/PWA_MOBILE_CHECKLIST.md`
- `docs/UI_REVIEW.md`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-134.

## Критерии готовности

- На физическом телефоне владельца проверены установка, icon/title, standalone launch и повторный запуск.
- Проверены Overview, Inventory, Sales, Team, language, theme, Sale и Receive.
- Demo mutations сохраняются после закрытия и повторного открытия приложения; Reset возвращает baseline.
- Для второй mobile platform выполнен physical-device check либо явно отмечен emulator/manual follow-up для TASK-061.
- Каждый дефект записан с устройством, OS/browser, шагами и ожидаемым/фактическим результатом.

## Тесты

- Owner physical-device checklist.
- iOS Safari Add to Home Screen или Android Chrome Install App.
- Standalone relaunch and persistence smoke.

