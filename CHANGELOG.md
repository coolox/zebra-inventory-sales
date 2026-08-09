# Changelog

Все существенные изменения проекта фиксируются здесь. Формат — краткий результат, не список каждой строки кода.

## 2026-08-09

### Fixed

- Исправлен FX lookup при приёмке после полуночи: новая staging migration использует business date `Europe/Istanbul`, а не UTC-date timestamp.
- Receive Flow больше не показывает ошибку про обменный курс для любой неудачной приёмки; сообщения различают курс, доступ и некорректные данные.
- Клиент больше не отправляет UTC timestamp как источник business date при сохранении приёмки.
- Фотокарусель теперь получает подписанную ссылку на каждую сохранённую фотографию, а не только часть batch-результата.
- Полноэкранный viewer больше не закрывается при zoom или переходе между фотографиями; карточка также синхронизирует все доступные файлы из Storage-папки модели.
- В viewer добавлен drag/pan для увеличенной фотографии на desktop и touch-устройствах.
- Product Card получила контекстный переход в New Sale с предзаполненным model code.
- Верхняя ценовая карточка товара теперь показывает `Sell price` = 3× закупочной цены в исходной валюте.
- Исправлено отображение supplier у товаров, загруженных из Supabase.
- Подготовлена atomic sales migration: sales/lines/payments, stock guard, price/cost/FX snapshots, inventory movement и audit log.
- New Sale подключён к live `confirm_sale` RPC; успешная операция обновляет реальные остатки, а ошибки недостатка товара и FX выводятся в форме.

### Added

- Добавлена migration `20260809010000_receipt_business_date.sql` и инструкция по безопасному применению в staging.
- Live catalog читает из Supabase модели, варианты, последние закупочные цены и журнал движений; после успешной приёмки таблица остатков обновляется без mock state.
- Добавлена pagination каталога: 10 SKU на страницу, переходы вперёд/назад и автоматический сброс при поиске.
- Подготовлены private `product-images` Storage bucket, store-scoped policies, `add_product_image` RPC и Product Card upload flow для JPEG/PNG/WebP до 8 MB.
- Нажатие на изображение в Product Card открывает полноэкранный viewer со сменой фото и zoom 100–300%.

## 2026-08-08

### Added

- Создано одностраничное Next.js + Tailwind demo Zebra Retail.
- Добавлены роли владельца и продавца, три магазина, mock-склад, продажи и приёмка из текста.
- Добавлены mock-управление продавцами, периоды отчётов, поиск и адаптивная навигация.
- Проведён read-only аудит существующего Zebra Telegram Bot и SQLite-модели на VPS.
- Созданы `AGENTS.md` и комплект постоянной проектной документации для handoff между чатами, моделями и агентами.
- Реализован новый Sale Flow: model code → доступный color → доступный size → actual price/currency → multi-item cart.
- Текстовая mock-приёмка заменена ручной формой с автоподстановкой существующей модели и быстрыми suggestions.
- Добавлен Owner low-stock carousel с автоматической сменой конкретного товара каждые 4,2 секунды.
- Mock-каталог дополнен вариантами одной модели с общим barcode/code.

### Changed

- Seller dashboard больше не показывает selector магазина и low-stock KPI.
- Активный demo-интерфейс сужен до clothing pilot Zebra Boutique.
- Все четыре mock Seller назначены в clothing store; форма добавления Seller теперь требует email и phone.
- Магазин переименован из Zebra Woman в Zebra Boutique.
- Приёмка перестроена в матрицу color → sizes → quantity; неоднозначная кнопка `Add another variant` удалена.
- Добавлены Light/Dark themes с сохранением выбора в браузере.
- Seller может задавать личные day/week/month/year goals в EUR.
- Строки склада открывают карточку модели с фотокаруселью, цветами, размерами и остатками.
- Сгенерировано 15 mock-фотографий для пяти clothing-моделей.
- Добавлены Supabase SDK, browser/server client helpers и `.env.example` без секретов.
- Добавлена первая Supabase migration: profiles, stores, memberships, каталог, suppliers, receipts, inventory movements, FX rates и RLS foundation.
- Добавлены Magic Link login, PKCE callback и middleware серверной проверки сессии; автоматическая регистрация неизвестных email выключена.
- Добавлен server-side active-membership guard, `/api/session` и access-denied state; при подключённом Supabase demo role switcher скрывается.
- Добавлена en/tr i18n foundation: language switcher на desktop/mobile, local persistence и синхронизация `profiles.locale`; локализованы ключевые dashboard, navigation и inventory labels.
- Удалены оставшиеся русские строки из production UI и mock data; gender/category domain values нормализованы в English keys.
- Подготовлена следующая Supabase migration с Owner-only audit log и idempotent `confirm_inventory_receipt` RPC для атомарной ручной приёмки.
- Подготовлена Owner-only `upsert_exchange_rate` RPC migration для ручных дневных EUR conversion rates с audit trail.
- Добавлен Owner FX settings UI; live Receive Flow вызывает staged `confirm_inventory_receipt`, а не изменяет mock-остатки.
- В стандартную size grid приёмки добавлен `2XL`; расширенные размеры остаются в `Other size`.
- Исправлен контраст выбранных chips в Light theme.
- Исправлена ошибка `LowStockCarousel` при изменении количества low-stock товаров.

### Verified

- Production build Next.js проходит.
- Local server возвращает HTTP 200.

### Known limitations

- Staging database существует, но каталог, приёмка и продажи в UI ещё mock и сбрасываются после перезагрузки.
- Magic Link ожидает `.env.local`, настройки redirect URL и ручную проверку с реальным email.
- После добавления membership guard Magic Link нужно повторно проверить локально; dev server в момент HTTP smoke-check не был запущен.
- Sale Flow, Receive Flow, Product Card, login и часть dialog states пока показывают English в Turkish locale; полный Turkish pass остаётся в backlog.
- Receipt migration ещё не применена и не проверена интеграционно на staging; UI пока использует mock receipt flow.
- Exchange-rate migration applied to staging; live UI still needs an authenticated manual test after the email rate limit resets.
- Real catalog/stock query ещё не подключён, поэтому staging receipt появится в базе, но не в mock inventory table до следующего этапа.
- Visual regression, i18n English/Turkish, tests и Supabase integration ещё не завершены.
- Write RPCs, server-side RBAC, audit log и live data connection ещё не реализованы.

### Product decisions

- Основной канал утверждён как web/PWA.
- Приложение разрабатывается первым; Telegram-бот адаптируется позже.
- Выбран Supabase Auth Magic Link.
- Базовая валюта утверждена как EUR.
- Утверждён чистый старт без миграции старого каталога и продаж.
- Продавцу разрешены закупка, маржа и продажи только своего магазина.
- Добавлена предварительная рекомендация Vercel + managed Supabase.
- Первый production MVP сужен до магазина одежды; обувь и сумки перенесены на следующие этапы.
- Зафиксированы English/Turkish, EUR base currency, transaction currencies EUR/USD/TRY/RUB/GBP и Cash/Card/Bank transfer.
- Зафиксирована business week Wednesday–Tuesday с будущей owner-настройкой.
- Описана clothing-модель: общий model code, отдельные size/color variants и поддержка существующих barcodes.
- Добавлен отдельный `docs/MVP_SCOPE.md` с exit criteria clothing pilot.
- Hosting Vercel + managed Supabase подтверждён.
- Утверждены multi-item sale, mixed payments и свободная фактическая цена без discount entity.
- Денежный возврат исключён из Clothing MVP; остаётся обмен.
- FX rates вводятся Owner вручную один раз в день.
- Barcode вводится вручную; AI extraction фотографии этикетки отложен.
- Подтверждены только роли Owner/Seller и pilot из пяти пользователей на iPhone/Android.
- Утверждены правила exchange: доплата при более дорогом товаре, без возврата разницы при более дешёвом.
- Seller получил право на exchange и cancellation ошибочной sale с обязательным audit для Owner.
- Customer receipt исключён из Clothing MVP.
- Purchase cost поддерживает EUR/USD/TRY/RUB/GBP.
- Owner приглашает Seller по email + phone через Supabase Magic Link.
- Product Discovery завершён; проект переведён на Frontend Foundation и visual review.
- Добавлен `docs/UI_REVIEW.md`.
