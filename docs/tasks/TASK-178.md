# TASK-178 — Разрешить Owner удалять ошибочно добавленные фотографии товара

Статус: COMPLETED

Приоритет: P1 — ошибочная private product photo должна удаляться безопасно и
контролируемо.

Источник: Owner physical Android walkthrough, 2026-08-21.

## Запрос Owner

После добавления фотографий к товару Owner должен иметь возможность удалить
случайно добавленную или неверную фотографию. Entry point может быть в `Edit Product`
или отдельной `Edit photographs` action, если она остаётся понятной на mobile.

При обычном просмотре карточки товара пользователь должен переключать фотографии
естественным swipe влево/вправо по carousel (с доступными кнопками/keyboard
альтернативой). Swipe не удаляет и не заменяет фото: destructive action остаётся
явной в режиме редактирования с подтверждением.

## Границы

- Только Owner удаляет фото в рамках разрешённого store/model/variant boundary.
- Просмотр существующих фотографий поддерживает touch swipe, без конфликтов с
  vertical page scroll, modal gestures или image zoom/pan.
- Удаление включает private Storage object и соответствующую database/reference
  запись атомарно либо с безопасной retry/compensation strategy; не оставляет
  orphaned file или broken carousel.
- Нельзя удалить чужое store photo, получить URL чужого private object или изменить
  historical receipt/sale/ledger data.
- Подтверждение, cancel, loading/error и empty-photo states должны быть понятны EN/TR
  на desktop/mobile.

## Критерии готовности

- Owner удаляет одну выбранную ошибочную фотографию; после reload carousel и Product
  Details больше её не показывают.
- Owner/Seller могут листать несколько фотографий swipe в карточке товара; keyboard
  и visible controls дают эквивалентную доступную навигацию.
- При удалении последней фотографии товар остаётся корректным с понятным empty state.
- Другие фото, товары и stores остаются нетронутыми; Seller/cross-store deletion
  server-side denied and audited where applicable.
- Storage/DB failure не создаёт false success; retry/recovery behaviour определён и
  протестирован.
- Targeted storage/RLS/UI tests, `npm run build` и physical mobile recheck проходят.

## Ограничение текущего этапа

Finding только зафиксирован. Дизайн, Storage operation и код не менять, пока Owner
не скажет, что закончил передавать найденные баги.

## Реализация и evidence

- Owner получает явный confirm/cancel/delete flow с loading/error/retry state;
  Seller не получает delete action. После success workspace reload убирает фото из
  carousel, а empty-photo state уже обрабатывается карточкой.
- Carousel поддерживает horizontal swipe на touch без блокировки vertical page
  scroll; visible controls, keyboard navigation и fullscreen zoom/pan сохранены.
- `remove_product_image` Owner/store-scoped, audited и retry-safe: активная DB
  reference удаляется до private Storage cleanup, а повтор после Storage failure
  разрешён без false success. Historical sale image snapshot удерживает Storage
  object и не ломается.
- `npx vitest run features/catalog/ui/product-card.test.tsx features/catalog/data/remove-product-image.test.ts` — 17/17 passed.
- `supabase/tests/database/037_product_image_removal_test.sql` — pgTAP 8/8 passed.
- `npm run build` — passed (only pre-existing lint warnings).
- Physical mobile recheck перенесён в consolidated TASK-165 согласно TASK-190.
