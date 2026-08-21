# TASK-166 — Обновить фирменный знак Zebra Boutique и PWA-иконки

Статус: COMPLETED

Источник: прямое указание Owner, 2026-08-20.

## Цель

Заменить прежний абстрактный знак `ZB` на предоставленный фирменный знак Zebra
Boutique в интерфейсе и в устанавливаемой PWA.

## Границы

- Использовать приложенное Owner изображение только как исходник фирменного знака.
- Обновить видимый знак в navigation и все PWA install assets (Android, maskable,
  iOS touch icon, favicon/metadata icons).
- Не менять business flows, Supabase, staging/production или секреты.
- Сохранить чёткое и читаемое изображение на светлом/тёмном фоне и в маленьком
  размере install icon.

## Критерии готовности

- Navigation показывает Zebra Boutique знак вместо прежнего `ZB`.
- Manifest и iOS/Android assets ссылаются на новые, валидные PNG-иконки нужных
  размеров.
- Component/manifest checks и production build проходят.
- Статус, roadmap и changelog отражают отдельную задачу до TASK-165.

## Результат

- Создана PWA-версия фирменного знака из Owner-provided reference: контрастная
  чёрно-белая зебра на графитовом фоне без мелкого текста, который теряется на
  домашнем экране.
- Заменены install assets с существующими стабильными URL:
  `zebra-192.png` (192×192), `zebra-512.png` (512×512),
  `zebra-maskable-512.png` (512×512) и `apple-touch-icon.png` (180×180).
  Manifest и metadata продолжают ссылаться на эти имена, поэтому никакие PWA
  integration points не изменены.
- Navigation вместо фиолетового `ZB` показывает знак Zebra Boutique и полное имя
  `ZEBRA BOUTIQUE`.
- Staging и Production не изменялись.

## Evidence

- `npm test -- --run app/manifest.test.ts components/layout/app-nav.test.tsx` —
  2 files, 3 tests passed.
- `npm run build` — passed (остаются только ранее существовавшие warnings в
  `app/page.tsx`; новый navigation image warning устранён).
- `git diff --check` — passed.
