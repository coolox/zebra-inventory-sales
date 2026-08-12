# Changelog

## 2026-08-11

- Added staged-ready inventory count documents with atomic, idempotent adjustment reconciliation and an Owner count form.
- Added Owner supplier directory create/edit/archive UI and auditable supplier RPCs that preserve historical receipts.
- Added store/model low-stock policies, real-balance query, Owner threshold control and policy-aware attention carousel.

## 2026-08-12

- Normalized Receive Flow colour chips across case and known English/Turkish synonyms, localized labels, and hid legacy boundary/currency test labels without modifying staging data.
- Added a server-only Owner Seller invitation boundary with audited, idempotent membership activation; staging email delivery remains opt-in.
- Applied Seller invitation migration and Owner safety guard to staging; live Owner form successfully delivered a test invitation email without exposing the server secret to the browser.
- Added an audited, idempotent Owner-only Seller deactivate/reactivate backend and protected status API; migration applied to staging and blocked memberships lose store access through existing RLS/session checks.
- Localized login, access-denied and Magic Link callback flows in English/Turkish, persisted locale across authentication redirects and removed technical auth-error details from user messages.

Все существенные изменения проекта фиксируются здесь. Формат — краткий результат, не список каждой строки кода.

## 2026-08-11

### Added

- Добавлена безопасная Owner-only inventory adjustment: отдельное signed ledger movement с обязательной причиной, transaction lock, запретом отрицательного balance, idempotency и audit before/after. Для Owner добавлена форма `Adjust stock` из выбранного variant; migration применена точечно на staging.
- В карточке товара добавлен `Movement history`: выбранный color/size variant открывает адаптивный диалог с количеством (+/−), типом операции, автором, причиной и Istanbul timestamp. Предусмотрены loading, empty, error/retry и Escape close; вложенные dialog исключены.
- Добавлен data-слой истории движений inventory: store/variant-scoped query читает audit ledger, присоединяет actor и нормализует receipt/sale/adjustment/exchange/transfer/write-off/cancellation для будущего UI карточки товара.
- Добавлено обратимое archive/restore модели товара: только Owner своего магазина может изменить `is_active`, операция аудируется, архивная модель остаётся в receipt/sale/inventory history и не может быть продана даже stale/direct запросом. Владелец видит отдельный список Archived и может восстановить модель.
- Зафиксирован code-first inventory: обязательный `Product code / Ürün Kodu`, internal UUID и полностью optional barcode, который можно добавить позже без изменения stock/history.
- AI-приёмка разложена на пошаговые TASK-089—093 и TASK-117—123: private document draft, OCR contract, catalog matching, variant reconciliation, review, atomic confirm, idempotency, color cleanup и hydration isolation.
- AI-продажа по фото этикеток разложена на TASK-124—130: private camera/batch upload, label extraction, in-stock matching, review, cart integration, atomic sale и security/mobile E2E coverage.
- Barcode lookup технически добавлен в live catalog, Inventory search, Sale и Receive, но оставлен необязательной неактивной возможностью до пересмотра identity schema в TASK-117.
- В ручной приёмке появился необязательный barcode: он сохраняется в demo draft и передаётся как `p_model.barcode` в live receipt RPC без AI/OCR.
- Добавлены mock barcode `869000990200` для модели `KM-9902` и `…201`–`…204` для её вариантов, unit search tests и component tests Sale/Receive barcode input.

### Verified

- `npm run test`: 66/66; `npx tsc --noEmit`, `npm run build` и `git diff --check` проходят. Добавлены form и pgTAP atomicity/RLS/idempotency tests adjustment; staging smoke `+1/-1` вернул stock к исходным 3 и оставил 2 movements/2 audit records. Production не изменялся.
- `npm run test`: 64/64; `npx tsc --noEmit`, `npm run build` и `git diff --check` проходят. Browser smoke подтверждён для desktop и 390×844 mobile в чистом demo production build.
- `npm run test`: 59/59; `npx tsc --noEmit` и `npm run build` проходят. Добавлены unit mapper tests и pgTAP RLS fixture истории движений.
- `npm run test`: 57/57; `npm run build` проходит. Новый pgTAP набор Owner/Seller/audit/sale guard добавлен, но local Supabase CLI в этой среде не вернул финальный вывод — повторить перед staging apply.
- `npm test -- --run`: 55/55; `npx tsc --noEmit`, `npm run build` и `git diff --check` проходят.

### Fixed

- Устранено расхождение SSR и первого client render в `Home`: live-режим теперь включается после hydration, а стартовый workspace shell детерминирован. Это убирает Recoverable Hydration Error при разной runtime-конфигурации server/browser; production build проходит.
- Архивирование в demo больше не требует database UUID: все варианты модели меняют статус по общему Product code, поэтому кнопка Archive работает и до подключения live Supabase.
- Local demo browser smoke: Inventory находит четыре варианта по `869000990200`; Sale сохраняет picker color → size; Receive находит `KM-9902` и переносит barcode в draft. Staging не изменялся.

## 2026-08-10

### Added

- Добавлена barcode migration: один case-insensitive barcode принадлежит одной модели или варианту в пределах магазина, с lookup indexes, cross-table concurrency guard и pgTAP RLS coverage; local Supabase suite 32 checks проходит.
- Добавлены en/tr copy-модуль Receive Flow, component-тесты локализации/draft/error state и mobile Playwright smoke приёмки.
- Receipt suite расширен до 17 тестов: multi-line matrix и native-currency payload, membership/empty guards, invalid quantity/cost/currency и form submission.
- На `zebra-retail-staging` подтверждена receipt business-date migration: EUR/USD boundary fixture дал 2 receipt lines, 2 movements, 2 audit records, корректный Istanbul FX snapshot и idempotent replay; production не изменялся.
- Product Card получила полный en/tr copy, localized upload errors/aria labels и keyboard viewer (`←/→`, `+/-`, `Esc`); component suite расширен до 40 tests.
- На staging подтверждены product-images bucket/RPC/RLS, 9 связанных Storage/DB records, carousel после reload и cross-store denial; fresh file upload smoke остаётся pending из-за настройки Chrome extension.
- Product photo tests покрывают JPEG/PNG/WebP, лимит 8 MiB, cleanup при partial failure, multi-file callback, carousel, close isolation и reset zoom/pan; полный suite проходит 47/47.
- Live receipt RPC payload и localized access/FX/validation/duplicate error mapping вынесены в `features/receipts` и покрыты unit tests.
- Добавлена чистая demo receipt calculation в `features/receipts`: валидация quantities, merge существующего variant, детерминированное создание нового и receipt activity result.
- Добавлен Playwright e2e сценарий demo sale одного variant двумя строками в EUR и USD: проверяются две позиции, success toast и точное списание остатка; desktop/mobile suite проходит.
- Добавлен Playwright foundation без secrets: demo server на localhost, Chromium desktop/mobile viewport и smoke dashboard suite (2/2 PASS).
- Добавлен pgTAP integration suite atomic sales RPC: mixed EUR/USD payments, FX snapshots, repeated variant lines, rollback insufficient-stock/missing-FX/payment-mismatch, movements и audit; 25 checks проходят после чистого reset.
- Добавлен воспроизводимый локальный Supabase/pgTAP harness: pinned CLI-команды, чистый reset migrations и baseline schema/RPC checks; два последовательных прогона прошли успешно (7/7).
- Sale Flow получил два режима: `Per-item price` и `Total sale price`.
- В общей цене несколько товаров оформляются одной single/mixed оплатой без фактических цен отдельных строк.
- Подготовлена атомарная migration/RPC с sale-level EUR revenue, native payment snapshots, stock movements и audit.
- Migration общей цены применена к `zebra-retail-staging`; production не изменялся.
- Добавлены regression tests для single total price и multi-item 50 EUR + 50 USD; всего проходят 17 tests.
- Завершён авторизованный smoke-test `sale_total` на `zebra-retail-staging`: три товара с оплатой 50 EUR + 50 USD, payment/FX snapshots, inventory movements, audit и rollback при недостаточном остатке подтверждены; production не затрагивался.
- Подтверждена staging sale одного variant двумя разными строками 100 EUR и 100 USD: native payment/FX snapshots, stock movements, audit и rollback при недостаточном остатке работают атомарно.

### Changed

- Receive Flow перенесён в `features/receipts/ui`; legacy component path удалён без изменения поведения формы.
- Product Card перенесена в `features/catalog/ui`; carousel, fullscreen zoom/pan, upload и sell callbacks сохранены.
- Mixed payment теперь относится ко всей корзине и больше не ограничен одним товаром.
- Live/demo reporting сохраняет общий revenue; распределение по товарам используется только как явно помеченная аналитическая allocation.
- Price Type стал первым обязательным шагом New Sale; product fields скрыты до выбора режима.
- В Per-item price чекбокс Mixed payment перенесён перед Actual sale price; в Total sale price сохранён перед общей суммой.

### Fixed

- New Sale в live mode заново загружает дневные Owner FX rates перед открытием: сохранённые TRY/USD rates сразу доступны в Mixed Payment; добавлены regression tests загрузчика курсов.
- Для одной позиции в `Per-item price` Mixed Payment автоматически конвертирует все payment lines в EUR и подставляет цену sale line; ручное поле цены скрыто.
- В Light theme placeholder полей теперь светлее, а введённые значения тёмные и читаемые.
- Receive Flow сохраняет выбранное количество в итоговой кнопке, явно отличает серые примеры от введённых данных и объясняет незаполненные обязательные поля вместо молча заблокированного действия.
- Inventory сортирует товары в наличии перед вариантами с нулевым остатком до пагинации; добавлены regression tests, полный suite проходит 49/49.
- Demo receipt теперь атомарно отклоняет неположительную/нечисловую стоимость и неподдерживаемую валюту до изменения локального склада.
- В Per-item price строки Mixed payment теперь открываются сразу после галочки, до ввода цены; до появления общей суммы показывается корректная подсказка вместо ложной ошибки баланса.
- Добавлен regression test этого сценария; всего проходят 19 tests.

## 2026-08-09

### Architecture

- Введён task-based workflow с минимальным контекстом: `PROJECT_STATUS.md`, компактная `ARCHITECTURE.md` и 100 последовательных `docs/tasks/TASK-NNN.md`; TASK-001 оставлен в статусе `pending`.
- Начато постепенное разделение frontend на feature-модули: добавлены `features/workspace` и `features/catalog`.
- Введён `NEXT_PUBLIC_APP_MODE=demo|live`; middleware, Auth и workspace data используют одну границу режима.
- Live workspace загружает catalog, sales, sellers и activity из Supabase, а mock-данные доступны только demo source.
- При ошибке live-загрузки показывается retry-state без подстановки вымышленной выручки, продавцов или операций.
- Стабильный UUID варианта теперь используется как client product id в live-каталоге.
- Добавлен `features/sales`: live query/mutation, локализованные domain errors, demo calculation и Sale Flow отделены от dashboard composition.

### Fixed

- Подготовлена migration `20260809153000_sale_line_identity.sql`: один variant может иметь отдельные sale lines с разными actual price/currency, а одинаковые variant + price + currency остаются уникальными; staging application вынесено в TASK-002.
- Seller Goal получил отдельный пункт навигации для роли Seller и перенесён в `features/seller-goals`.
- FX form больше не просит вводить непривычный обратный курс: Owner вводит `1 EUR = X currency`, видит preview, а database `eur_rate` вычисляется автоматически.
- Mixed-currency Activity Feed показывает original totals и отмечает EUR total как конвертированное значение вместо неясной единственной суммы.
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
- Demo sale теперь проверяет всю корзину до изменения state и не допускает частичного списания при устаревшем остатке.
- Sale Flow полностью локализован на English/Turkish, включая empty/error states и элементы корзины.
- Исправлено неявное добавление выбранной, но не добавленной через picker позиции при подтверждении продажи.
- Известные ошибки продажи теперь показывают безопасные локализованные действия вместо общего database fallback.
- На `zebra-retail-staging` применены migrations для повторных строк variant с разными price/currency и native-currency payments; ручная проверка sale/rollback остаётся в TASK-002.
- Sale Flow больше не показывает редактор split payments для каждой продажи: обычная sale использует один выбранный способ оплаты, а несколько payment lines доступны только после `Mixed payment`.
- Заполненная следующая позиция теперь сразу включается в Current sale и `Sell N items`; повторный клик `Add another item` для её учёта больше не нужен.
- Sale Flow больше не считает повторно выбранный size сверх остатка: при резервировании последней единицы показывается понятное предупреждение, а в sale отправляется только доступная строка.
- Mixed payment теперь выбирается до ввода цены: для single-item sale обычные поля скрываются, две payment lines показываются сразу, а итоговая EUR-цена рассчитывается автоматически; в multi-item mode этот shortcut недоступен.

### Added

- Добавлена migration `20260809010000_receipt_business_date.sql` и инструкция по безопасному применению в staging.
- Live catalog читает из Supabase модели, варианты, последние закупочные цены и журнал движений; после успешной приёмки таблица остатков обновляется без mock state.
- Добавлена pagination каталога: 10 SKU на страницу, переходы вперёд/назад и автоматический сброс при поиске.
- Подготовлены private `product-images` Storage bucket, store-scoped policies, `add_product_image` RPC и Product Card upload flow для JPEG/PNG/WebP до 8 MB.
- Нажатие на изображение в Product Card открывает полноэкранный viewer со сменой фото и zoom 100–300%.
- Подготовлена migration `20260809160000_native_currency_payments.sql`: каждая payment line хранит исходную сумму/валюту, FX snapshot и EUR значение.
- Sale Flow поддерживает Cash/Card/Bank transfer в EUR/USD/TRY/RUB/GBP, разбивку оплаты и EUR preview.
- Добавлены Vitest + React Testing Library, 10 unit/component tests для payment calculations, live RPC payload, demo sale и Sale Flow.

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

- Утверждена модель общей цены multi-item sale: платежи относятся ко всей продаже, а выручка не распределяется по товарам искусственно; реализация разбита на TASK-106–TASK-111.
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
- Уточнён UX оплаты: обычная sale использует одну явно выбранную Cash/Card/Bank transfer payment line; несколько payment lines открываются только чекбоксом `Mixed payment`.
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
# 2026-08-12

- Added an authenticated pgTAP RLS regression suite for Owner, Seller, cross-store and anonymous boundaries.
- Added shared accessible form primitives, Owner-only `SellerManager`, pure overview/inventory selectors, dashboard shell foundation and versioned demo persistence adapter.
- Consolidated dashboard design tokens and responsive rules; Playwright now validates production-like desktop, tablet, mobile and light-theme smoke flows.
- Extracted dashboard navigation, header and shell composition into reusable layout components.
- Extracted KPI, chart, Seller ranking and goal composition into the read-only Overview feature.
- Extracted inventory search, pagination and Product Card selection into InventoryList.
- Extracted compact/full Activity Feed with unified original-currency formatting.
- Added stable dashboard section URLs with deep-link and mobile-navigation coverage.
- Persisted demo workspace mutations across reloads and added a reset-to-baseline control.
- Added transport-independent session and workspace contracts at the API boundary.
- Added catalog, receipt and inventory contracts with explicit receipt idempotency mapping.
- Added sales and payment contracts for repeated priced variants and native-currency payments.
- Localized dashboard low-stock states and made KPI formatting locale-aware.
- Added install-safe Zebra Retail PWA manifest, standalone metadata and maskable icons.
- Paused the task sequence for owner mobile verification of the PWA install flow before continuing non-PWA work.
- Added TASK-131–TASK-136 as a gated PWA hardening, HTTPS preview and physical-device verification track before accessibility work resumes.
- Added reproducible Android/iOS PNG install assets with manifest, dimension, MIME and browser coverage.
- Restored Overview KPI, chart and seller-ranking presentation after locale formatting changes.
- Localized the PWA preview-critical Audit Log, Seller Goal, modal close/access-loading and navigation labels; added Turkish component and browser smoke coverage.
- Published an isolated Vercel HTTPS demo preview for physical PWA installation testing; it is pinned to demo mode with no Supabase or VPS connection.
- Replaced the PWA Android/iOS icon set with the approved black-and-white zebra-striped `Z`; regenerated PNG and maskable assets.
