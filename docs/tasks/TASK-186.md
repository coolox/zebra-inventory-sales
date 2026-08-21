# TASK-186 — Показать фото проданного товара в Sale Details с fullscreen preview

Статус: COMPLETED

Приоритет: P2 — Sales History должна позволять быстро распознать проданный товар,
а не только его code/name/size.

Источник: Owner physical mobile walkthrough screenshot, 2026-08-21.

## Запрос Owner

В Sale Details рядом с каждой строкой проданного товара показать небольшую фотографию
товара. При tap фотография открывается в полноэкранном viewer, чтобы Owner/Seller мог
понять, что именно было продано, до exchange/cancellation action.

## Важная граница historical data

Фото должно соответствовать тому, что было продано, а не случайно исчезать или
меняться вслед за текущей gallery товара. Перед реализацией определить и закрепить
sale-time image reference/snapshot strategy, совместимую с TASK-178 photo deletion:
удаление ошибочного current product photo не должно сломать historical Sale Details
или раскрыть чужой private object.

## Границы

- Sale Details line item thumbnail, loading/empty/error state и accessible fullscreen
  image viewer.
- Использовать только private authorized image access в scope sale store/role.
- Не менять sale totals, payments, cancellation/exchange atomic rules, audit or
  product-photo ownership/RLS boundaries.

## Критерии готовности

- Каждая sale line с доступным фото показывает компактный thumbnail рядом с product
  name/code/colour/size; line без photo имеет понятный neutral fallback.
- Tap/click открывает fullscreen viewer с close, safe-area layout, focus restoration,
  image zoom/pan where supported and no background scroll leak.
- Историческая sale остаётся понятной после изменения текущей product gallery;
  private URL/Storage access не выходит за Owner/Seller/store authorization.
- Multiple lines/photos, cancelled/exchanged sales, missing/deleted source images,
  mobile/desktop and EN/TR accessible labels проходят.
- Targeted UI/storage/RLS tests, `npm run build` и physical mobile recheck проходят.

## Ограничение текущего этапа

Finding/request только зафиксирован. Data strategy, дизайн и код не менять, пока
Owner не скажет, что закончил передавать найденные баги.

## Evidence

- Sale lines snapshot an authorized private image storage path at sale time; live
  history signs only that snapshot for the authorized store member. Missing legacy
  images show a neutral fallback, and the fullscreen viewer is available on tap.
- Current-gallery deletion is constrained by the historical reference strategy for
  TASK-178; past sale details do not resolve a replacement gallery image.
- `npx vitest run features/sales/ui/sale-history.test.tsx` — 8/8 passed;
  `npm run build` passed. Physical mobile acceptance is batched into TASK-165.

## Follow-up visual acceptance gap — 2026-08-22

- Owner local-demo screenshot shows a neutral `—` placeholder in Sale Details for
  `Structured Jacket`; sellers therefore still cannot identify that line by photo.
- TASK-186 technical historical-snapshot boundary remains valid, but it does not
  demonstrate the Owner's photo-first recognition scenario in current demo. That
  visual/fixture acceptance gap is isolated in [TASK-196](TASK-196.md).
- Do not change TASK-186 implementation during renewed visual intake.
