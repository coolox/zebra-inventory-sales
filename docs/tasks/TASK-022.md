# TASK-022 — Применить product-images migration на staging

Статус: IN PROGRESS

## Частично подтверждено на staging (2026-08-10)

- На `zebra-retail-staging` присутствуют private bucket `product-images`, лимит 8 MiB, MIME allowlist JPEG/PNG/WebP, RPC `add_product_image` и все 3 RLS policies.
- В Storage и `product_images` подтверждены 9 связанных объектов/records (JPEG и PNG); позиции carousel сохранены.
- Авторизованный live Product Card после reload показывает carousel `1 / 3`, кнопка Next активна.
- Посторонний authenticated subject видит 0 объектов и получает `new row violates row-level security policy` при попытке cross-store upload.
- Fresh upload и негативные MIME/oversize проверки остаются незавершёнными: Chrome extension не выдаёт file chooser до включения **Allow access to file URLs** в `chrome://extensions` → ChatGPT browser extension → Details.
- Production не изменялся.

## Цель

Включить private Storage flow и подтвердить загрузку нескольких фото реального продукта.

## Предполагаемые файлы

- `supabase/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/tasks/TASK-022.md`

## Зависимости

Нет.

## Критерии готовности

- `20260809013000_product_images.sql` применена в staging.
- Store member загружает JPEG/PNG/WebP, посторонний store не имеет доступа.
- Carousel сохраняется после reload.

## Тесты

- Upload valid files and reload.
- Reject unsupported type/oversize.
- RLS cross-store access check.

## Проверка учёта 2026-08-13

- Migration, private bucket/RPC/RLS, существующие JPEG/PNG records, cross-store denial и carousel после reload подтверждены на staging.
- Наличие ранее загруженных объектов не заменяет обязательный fresh valid upload smoke.
- TASK остаётся `pending` до двух проверок: свежая допустимая загрузка с reload и отклонение unsupported MIME/oversize. Production не изменять.

## Текущее продолжение (2026-08-15)

- Staging Supabase Site URL и callback allow-list переключены на актуальный Preview
  `https://zebra-inventory-sales-fkn819bfk-cooloxs-projects.vercel.app`.
- Для обязательного fresh UI upload требуется уже авторизованная Owner-сессия этого
  staging приложения. Агент не отправлял Magic Link и не открывал почтовые ящики:
  для продолжения Owner должен войти в открытый staging tab и сообщить, когда готов.
- После входа остаются: загрузить допустимые JPEG/PNG/WebP, reload и подтвердить
  carousel; затем проверить unsupported MIME и файл больше 8 MiB. Production не
  менять.
