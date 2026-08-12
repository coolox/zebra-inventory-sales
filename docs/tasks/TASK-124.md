# TASK-124 — Добавить private sale-label image drafts

Статус: pending

## Цель

Безопасно принимать фото товарных этикеток с камеры или file picker и сохранять их как временный store-scoped sale draft без изменения cart, catalog или stock.

## Предполагаемые файлы

- `supabase/migrations/<new>_sale_label_drafts.sql`
- `features/sale-labels/data/**`
- `features/sale-labels/model/**`

## Зависимости

TASK-043, TASK-090, TASK-117.

## Критерии готовности

- Поддержаны одна фотография и batch upload нескольких labels.
- Files хранятся private, store-scoped, с validated MIME/size/path и ограниченным retention.
- Draft принадлежит seller/store и имеет статусы uploaded → extracting → needs_review → ready/failed.
- File fingerprint защищает от случайной повторной загрузки одного и того же изображения.
- Upload/extraction не создаёт cart lines, products, sales или inventory movements.

## Тесты

- MIME/size/path/RLS tests.
- Single/batch upload, reload and expiry cleanup.
- Duplicate-file fingerprint и cross-store denial.

