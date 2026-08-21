# TASK-152 — Сделать архивные товары понятными для поиска и восстановления

Статус: COMPLETED

Источник: feedback Owner во время walkthrough TASK-086, 2026-08-17.

## Проблема

После архивации товара Owner не понимает, где снова найти этот товар и как вернуть
его из архива. В TASK-028 уже реализованы Owner-only archive/restore flow и отдельный
список Archived, поэтому это не отсутствие backend-возможности, а проблема
discoverability и понятности интерфейса.

## Ожидаемый результат

- В Catalog есть очевидный и доступный на desktop/mobile путь к архивным товарам.
- Состояние Archived и действие восстановления названы понятно на English/Turkish.
- Из архивного списка можно открыть нужный товар и явно вернуть его в активный
  каталог с подтверждением результата.
- Пустое состояние объясняет, что архивных товаров нет, а error state не создаёт
  ложного впечатления успешного восстановления.
- Archive/restore остаётся только Owner-действием; Seller и store boundaries не
  ослабляются.

## Перед реализацией

- Воспроизвести текущий путь в staging на mobile и desktop.
- Проверить, почему существующий Archived entry из TASK-028 не был найден: label,
  placement, navigation state или responsive layout.
- Выбрать минимальное UI-изменение после завершения сбора feedback TASK-086.

## Проверки

- UI tests для перехода в Archived, empty/error states и восстановления.
- EN/TR labels.
- Mobile walkthrough без horizontal overflow.
- `npm run build`.

## Ограничение

Не начинать исправление, пока Owner не сообщит, что сбор проблем TASK-086 завершён.

## Результат — 2026-08-18

- Причина discoverability подтверждена в коде и local production walkthrough:
  ссылка была `10px`, находилась рядом со статистикой SKU и исчезала полностью при
  пустом архиве.
- В Owner Inventory добавлена постоянная заметная кнопка `Archived products` /
  `Arşivlenmiş ürünler` с количеством архивных моделей, включая `0`.
- Новый адаптивный список объясняет назначение архива, показывает понятное пустое
  состояние, позволяет открыть карточку или сразу выполнить `Restore to catalog` /
  `Kataloğa geri yükle`.
- Restore обновляет локальное состояние только после успешного Owner RPC; ошибка
  остаётся в строке товара и не показывает ложное подтверждение. Server-side
  Owner/store boundary существующего RPC не менялась.
- Staging deployment намеренно отложен: по решению Owner исправления TASK-152—163
  накапливаются для одного Preview и одного Magic Link acceptance цикла.

## Evidence

- Component/UI: 15/15 targeted tests PASS; EN/TR, empty, success и error states.
- Full Vitest: 82 files / 196 tests PASS.
- TypeScript PASS; ESLint 0 errors / 24 pre-existing warnings.
- Demo и live production builds PASS.
- Playwright: 60/60 PASS; archive → discover → restore сценарий прошёл на desktop,
  tablet и mobile без horizontal overflow.
