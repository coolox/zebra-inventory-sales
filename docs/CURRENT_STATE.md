# Текущее состояние проекта

Обновлено: 2026-08-09  
Текущий этап: `Этап 2 — Frontend foundation`; backend foundation этапа 3 развивается параллельно
Общий статус: начато постепенное разделение frontend на feature-модули. Demo и live workspace теперь имеют явную границу данных; staging-интеграции требуют повторной ручной проверки.

## 1. Что работает сейчас

- Next.js-приложение запускается локально.
- Одностраничный dashboard поддерживает preview владельца и продавца.
- Активный интерфейс demo сужен до clothing pilot `Zebra Boutique`; shoes/bags остаются только в будущей архитектуре и части legacy mocks.
- Работает фильтр периода.
- Работает складской поиск.
- Продажа работает по цепочке code → color → size → actual price/currency, поддерживает несколько товаров и уменьшает остатки.
- Ручная приёмка начинается с model code, подставляет найденную модель и использует матрицу color → sizes → quantity; поступление объединяется с существующим вариантом.
- Клик по строке товара открывает карточку модели с тремя mock-фотографиями, carousel, colors, sizes и остатками variants.
- Seller самостоятельно задаёт EUR goal для day/week/month/year; цели сохраняются локально.
- Работают Light и Dark themes; выбор сохраняется локально.
- Стандартная размерная сетка приёмки содержит `2XL`; расширенные размеры добавляются через `Other size`.
- Light theme сохраняет контраст выбранных chips.
- Владелец видит автоматически меняющийся carousel конкретных low-stock вариантов; продавец low-stock KPI не видит.
- У Seller убран верхний selector магазина.
- Владелец может добавлять и удалять mock-продавцов; форма использует email + phone и фиксированный доступ к Zebra Boutique.
- Production build проходит.
- Добавлены Supabase browser/server clients с безопасной границей environment variables.
- Staging Supabase project создан с чистыми данными: legacy VPS/бот не импортируются.
- Первая Postgres migration с RLS применена к staging; Zebra Boutique создан. Owner Auth user создан, но active membership требует повторного idempotent bootstrap по обновлённой инструкции.
- Добавлены экран `/login`, Magic Link callback `/auth/callback` и middleware с проверкой серверной сессии. Вход допускает только уже приглашённые email (`shouldCreateUser: false`).
- Middleware дополнительно требует активный `store_memberships` для любой защищённой страницы; `/api/session` передаёт в UI только проверенные профиль и роль. В live-режиме Owner/Seller demo toggle скрыт.
- Добавлена i18n foundation только для `en` и `tr`: язык переключается на desktop/mobile, сохраняется в localStorage и синхронизируется с `profiles.locale` у авторизованного пользователя. Русские строки удалены из `app/`, `components/` и `lib/`; основные dashboard/nav/stock labels переведены, а Sale/Receive и часть модальных форм пока используют English в Turkish locale и требуют полного Turkish pass.
- В staging применены migration для audited inventory receipts и Owner-managed daily FX rates. Приёмка создаёт/находит supplier/model/variants, confirmed receipt, receipt lines, receipt movements и audit entry; для не-EUR требует сохранённый Owner FX rate на business date магазина.
- Owner FX rates UI использует `upsert_exchange_rate`. Receive Flow в live-режиме вызывает `confirm_inventory_receipt` и не использует mock product suggestions. Live catalog загружает models, variants, latest purchase cost и сумму inventory movements с RLS; после успешной приёмки таблица и поиск обновляются из staging.
- Подготовлена migration `20260809010000_receipt_business_date.sql`: она устраняет ошибку FX после полуночи Istanbul, когда UTC-date мог указывать на предыдущий день. UI теперь показывает точную пользовательскую ошибку, а не всегда обвиняет обменный курс. Migration ещё нужно применить в staging, после чего повторить одну приёмку.

## 2. Важное ограничение

Demo-режим остаётся локальным и сбрасывается после перезагрузки. Live-режим читает каталог, остатки, продажи, продавцов и activity из Supabase и не подставляет mock-значения, но пока не считается production-ready.

Пока отсутствуют: реальные Owner invite/management, exchange/cancellation UI, полностью подключённые mixed payments, автоматические тесты, CI, production SMTP/backup/monitoring и связь с Telegram-ботом или VPS.

## 3. Что было сделано последним

- Реализованы замечания F-006–F-010 второго раунда `docs/UI_REVIEW.md`.
- Добавлены `components/product-card.tsx` и `components/seller-goal-card.tsx`; Receive Flow перестроен.
- Для пяти mock-моделей сгенерировано и сохранено 15 каталожных изображений в `public/products/`.
- Магазин переименован в Zebra Boutique; добавлены Light/Dark themes и локально сохраняемые Seller goals.
- Исправлена runtime-ошибка low-stock carousel при изменении списка товаров; реализованы замечания F-011–F-013.
- Добавлены `@supabase/supabase-js@2.49.8`, `@supabase/ssr@0.5.2`, `.env.example`, SSR client helpers и `supabase/migrations/20260808123000_foundation.sql`.
- Создан чистый staging Supabase project; migration применена, создан Zebra Boutique. Данные VPS не переносились. Обновлена idempotent bootstrap-инструкция Owner и удалён конкретный auth identifier из репозитория.
- Добавлены Magic Link login, PKCE callback и session middleware; доступ к существующим пользователям ограничен приглашёнными email.
- Добавлен server-side membership guard и access-denied state; live dashboard получает роль из Supabase вместо demo role switcher.
- Добавлен `lib/i18n.ts`, English/Turkish language switcher и сохранение locale в profile preferences.
- Применены audited receipt и Owner-only exchange-rate migrations в staging; Magic Link Owner проверен вручную.
- Исправлен live Receipt Flow: база использует timezone магазина для FX business date, а UI различает ошибку курса, доступа и данных. Нужно применить follow-up migration и провести повторную приёмку.
- Подключена read-only загрузка live catalog/stock для active store; ручная проверка с первой сохранённой приёмкой остаётся обязательной.
- Каталог поддерживает client-side pagination по 10 SKU с корректным сбросом на первую страницу при поиске. Подготовлен private Supabase Storage flow для изображений: product card принимает JPEG/PNG/WebP до 8 MB, записывает безопасный Storage path через RPC и обновляет carousel; migration ещё нужно применить в staging.
- Исправлена загрузка фотокарусели: каждая запись `product_images` получает отдельную signed URL, а карточка также синхронизирует список защищённых файлов в папке модели. Нажатие на фото открывает полноэкранный viewer с переключением и масштабом 100–300%; события viewer изолированы от родительской карточки, поэтому zoom/стрелки больше не закрывают его. Требуется повторная ручная проверка нескольких фото.
- Полноэкранный viewer поддерживает drag/pan увеличенного изображения мышью и одним пальцем; при масштабе 100% drag отключён, при смене фото или возврате к 100% позиция сбрасывается.
- Product Card содержит контекстную кнопку `Sell this product`: она открывает стандартный Sale Flow с уже заполненным model code, после чего Seller выбирает color, size и фактическую цену.
- Верхняя price card в Product Card показывает предложенный `Sell price` как 3× последней закупочной цены в исходной валюте; фактическая цена продажи по-прежнему вводится Seller при оформлении sale.
- Исправлено отображение supplier в live catalog/Product Card: Supabase relation поддерживает оба корректных формата (object/array), поэтому имя поставщика больше не теряется в UI.
- Staging sales foundation подключён к live New Sale: `confirm_sale` проверяет active store access и остаток, фиксирует Seller, цену, cost snapshot, daily FX и движение `sale` в одной транзакции; после успеха Inventory перезагружается из Supabase. Ручной integration test остаётся обязательным.
- Добавлены `features/workspace` и `features/catalog`: `NEXT_PUBLIC_APP_MODE` явно разделяет demo/live, а live workspace загружает каталог, продажи, продавцов и activity только из Supabase. При ошибке mock fallback запрещён и показывается retry-state.
- Проведён source scan на кириллицу в production UI/data: русских строк не осталось; mock catalog, sellers, categories и timestamps приведены к English domain values.

## 4. Как проверено

- `npm run build` — успешно.
- `npx tsc --noEmit` — успешно.
- Локальный Next.js server возвращает HTTP 200.
- Локальный production server возвращает HTTP 200.
- Встроенный browser во время проверки был недоступен, поэтому визуальная regression-проверка и реальные клики на iPhone/Android ещё не зафиксированы.

## 5. Следующий рекомендуемый шаг

1. Продолжить модульное разделение: вынести sale query/mutation/error mapping из `app/page.tsx` в `features/sales`, не меняя UI.
2. Провести smoke-test обоих режимов: `NEXT_PUBLIC_APP_MODE=demo` без Auth и `NEXT_PUBLIC_APP_MODE=live` с реальным membership; проверить, что live никогда не показывает mock revenue/sellers.
3. Провести review Product Card, нового Receive Flow, Seller goals, обеих тем и low-stock carousel на mobile и desktop.
4. Добавить staging URL и publishable key только в локальный `.env.local`, затем перезапустить `npm run dev`.
5. Повторно назначить Owner через idempotent bootstrap SQL, затем обновить приложение и проверить Magic Link Owner: homepage доступна, role switcher отсутствует, logout работает.
6. Реализовать реальные Owner invite/phone flow и audit log.
7. Применить staging migration `20260809010000_receipt_business_date.sql`.
8. Проверить Owner FX settings и первую реальную staging-приёмку в UI: EUR и одну non-EUR currency, особенно после полуночи Istanbul.
9. Подтвердить, что таблица и поиск показывают реальные variants и остатки после приёмки.
10. Применить `20260809013000_product_images.sql` и проверить: открыть live product card → Add photos → выбрать JPEG/PNG/WebP → убедиться в carousel после reload.
11. Проверить live Sale Flow на одном товаре: успешная sale уменьшает остаток, повторная продажа не допускает отрицательный остаток, non-EUR требует дневной FX rate.
12. Добавить single/mixed payment selection и запись `sale_payments`.
13. Завершить локализацию Sale Flow, Receive Flow, Product Card, login и всех пустых/error states на Turkish.

Не подключать production Supabase до завершения visual review и frontend foundation. Database schema проектировать из утверждённых `MVP_SCOPE.md` и `DATA_MODEL.md`.

## 6. Блокеры

- Продуктовых блокеров нет.
- URL и publishable key staging-проекта должны попасть только в локальный `.env.local` или Vercel environment variables, не в чат и не в git.
- Production Supabase и Vercel ещё не создавались/не подключались.

## 7. Новые принятые решения

- продукт: web/PWA;
- приложение создаётся первым, Telegram-бот адаптируется позже;
- authentication: Supabase Magic Link;
- основная валюта: EUR;
- реальные товары заполняются с нуля, migration из старого бота не требуется;
- продавец видит закупку, маржу и продажи только своего магазина;
- владелец видит все магазины.
- первый MVP запускается только для clothing; shoes и bags добавляются позже;
- production UI: English/Turkish;
- transaction currencies: EUR/USD/TRY/RUB/GBP;
- payment methods: Cash/Card/Bank transfer;
- business week: Wednesday–Tuesday, позже owner-configurable;
- clothing model code общий для size/color variants; barcodes уже существуют.
- hosting: Vercel + managed Supabase;
- одна sale содержит несколько товаров и mixed payment lines;
- seller свободно задаёт фактическую цену, отдельного discount нет;
- только обмен, без денежного возврата в первом MVP;
- owner вручную вводит дневные FX rates;
- barcode/code вводится вручную; label photo AI переносится после MVP;
- только роли Owner и Seller;
- pilot: 1 Owner + 4 Sellers на iPhone/Android.
- при exchange на дешёвый товар разница не возвращается;
- Seller самостоятельно оформляет exchange/cancellation, Owner видит audit;
- customer receipt не нужен;
- purchase currencies: EUR/USD/TRY/RUB/GBP;
- Owner приглашает Seller по email + phone через Magic Link.
- В production/staging login разрешён только для предварительно приглашённых email; каждое открытие рабочей области требует активного store membership.

## 8. Файлы, которые чаще всего понадобятся

- `app/page.tsx` — текущая композиция dashboard; бизнес-операции постепенно выносятся из файла.
- `features/workspace/` — граница demo/live и загрузка единого workspace snapshot.
- `features/catalog/` — live data access каталога.
- `app/globals.css` — визуальные токены и тема.
- `lib/mock-data.ts` — демонстрационные данные.
- `lib/types.ts` — текущие клиентские типы.
- `docs/BOT_AUDIT.md` — факты о существующем боте.
- `docs/MVP_SCOPE.md` — точный scope clothing pilot.
- `docs/UI_REVIEW.md` — следующий диалог и список визуальных изменений.
- `docs/ROADMAP.md` — порядок дальнейшей реализации.
- `supabase/README.md` — безопасный порядок применения миграции.
- `app/login/page.tsx`, `app/auth/callback/route.ts`, `middleware.ts`, `app/api/session/route.ts` — Magic Link вход, session и membership guards.
