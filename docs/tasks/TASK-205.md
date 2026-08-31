# TASK-205 — Добавить camera capture к загрузке фото товара

Статус: PAUSED

2026-08-31: Owner решил сначала закончить все bug fixes, затем сделать один общий
remediation build. Camera code и automated checks готовы; TASK ожидает общего
publication/physical acceptance вместе с TASK-203, TASK-207 и TASK-208.

## Источник

2026-08-25 Owner pilot observation: при добавлении фотографий в Product Details
пользователь может выбрать только существующее изображение из gallery. Нужна
явная возможность сразу сфотографировать товар и добавить снимок.

## Текущее состояние

`ProductCard` использует один скрытый multi-file input для JPEG/PNG/WebP. Он
открывает системный picker, но не предлагает отдельный понятный camera path.

## Цель

На mobile дать Owner два ясных действия: **Снять фото** и **Выбрать из
галереи**. На desktop сохранить обычный upload path. Оба варианта используют
одинаковые private-photo validation, upload, error и Owner-only deletion
boundaries.

## Критерии готовности

- Mobile camera action запрашивает заднюю камеру через корректный file input
  capture hint и не требует browser permission вне системного photo flow.
- Gallery action продолжает поддерживать несколько JPEG/PNG/WebP.
- Camera output проходит тот же type/size validation и сохраняется как private
  product photo; не попадает в audit/history как public URL.
- Cancel/permission denied/unsupported device имеют понятный fallback к gallery.
- EN/TR labels, keyboard access, light/dark states и existing deletion flow не
  деградируют.

## Тесты

- Component tests: camera/gallery controls, file acceptance and error state.
- Mobile browser evidence: take photo → preview/save → reopen Product Details.
- Existing photo upload/delete regression plus production build.

## Реализация и текущая проверка — 2026-08-31

- `ProductCard` получил отдельные mobile controls: `Fotoğraf çek` / `Take photo`
  открывает single-file input с `capture="environment"`; `Galeriden seç` /
  `Choose from gallery` сохраняет existing multi-file flow.
- Оба input принимают только JPEG/PNG/WebP и вызывают один существующий private
  upload callback. Размер, MIME, Owner authorization, private Storage path,
  error copy и protected historical-photo/delete boundaries не изменены.
- При cancel, camera denial или unsupported capture hint gallery control всегда
  остаётся доступен; браузер не запрашивает отдельный programmatic camera
  permission вне системного file picker.
- Component/data regression: 2 files / 19 tests passed, включая rear-camera
  hint, multi-file gallery и single camera File upload.
- `npm run build:demo` и `npm run build:live` — passed; только прежние unrelated
  warnings в `app/page.tsx`.

TASK остаётся `IN PROGRESS` до consolidated publication и физического mobile
camera → preview/save → reopen Product Details acceptance Owner.
