# TASK-205 — Добавить camera capture к загрузке фото товара

Статус: pending

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
