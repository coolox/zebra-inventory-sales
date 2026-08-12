# Статус проекта

## Что уже реализовано

- Утверждён Clothing MVP для Zebra Boutique, роли Owner/Seller, English/Turkish, EUR reporting и transaction currencies EUR/USD/TRY/RUB/GBP.
- Созданы Next.js dashboard, Light/Dark themes, адаптивная навигация, каталог, Product Card, Sale Flow, Receive Flow, Seller Goal и Owner FX UI.
- Подготовлены Supabase schema/RLS, Magic Link session boundary, receipts, FX, private product images и atomic sales migrations.
- На staging подтверждены follow-up migrations: один variant можно продавать строками с разными price/currency, а mixed payments сохраняются в исходной валюте с FX snapshot и атомарным rollback при недостаточном остатке.
- Demo/live data sources разделены; live mode не подставляет mock-данные при ошибке.
- Catalog, workspace, exchange rates, seller goals и sales частично выделены в feature-модули.

## Что сейчас работает

- Production build и TypeScript проходят.
- Demo поддерживает поиск, multi-item sale, receipt, локальные Seller actions и role preview.
- Live workspace читает store-scoped catalog, stock, sales, sellers и activity из staging Supabase.
- Live receipt и sale RPC создают inventory movements и audit records атомарно.
- На staging подтверждены private product-images bucket/RPC/RLS, 9 связанных Storage/DB records и carousel после reload; fresh upload smoke ещё требует file access в Chrome extension.
- Magic Link callback и active-membership guard реализованы; production ещё не подключён.
- Sale Flow начинается с обязательного выбора `Per-item price` или `Total sale price`; только затем открываются code, color и size. В обоих режимах Mixed payment расположен перед соответствующим вводом суммы; в Per-item две строки оплаты появляются сразу после галочки, ещё до ввода цены.
- Для одной позиции в `Per-item price` Mixed Payment автоматически определяет EUR-цену по введённым payment lines; ручной расчёт и ввод точной цены не требуются.
- Перед каждым открытием live New Sale заново загружаются Owner FX rates текущей Istanbul business date, поэтому только что сохранённые TRY/USD rates доступны без перезагрузки страницы.
- Vitest и React Testing Library suite содержит 55 unit/component tests для sales, receipts, catalog sorting, barcode lookup и Product Card, включая FX rate loading, upload validation/rollback, carousel, zoom/pan и viewer states.
- Barcode lookup технически доступен в catalog, Sale и Receive, но по решению владельца не является обязательным operational flow: Clothing inventory остаётся code-first, barcode nullable и может быть добавлен позже.
- Утверждён будущий AI receipt flow: фото/PDF накладной → private draft → OCR/AI extraction → exact catalog matching по `Ürün Kodu` → распределение quantities по color/size → review → явное атомарное подтверждение. До Confirm stock не меняется.
- В Light theme placeholder и введённый текст Receive Flow визуально разделены; выбранное количество больше не превращается в ложный итог `0`, а незаполненные обязательные поля объясняются явно.
- Inventory сортирует варианты с положительным остатком перед нулевыми до пагинации.
- Подготовлена локально проверенная barcode migration: store-scoped, case-insensitive ownership между models/variants, lookup indexes и RLS regression coverage. Staging/production ещё не изменялись.
- Авторизованный staging smoke-test подтвердил обычную multi-item `per_item` sale, `sale_total` из трёх товаров с 50 EUR + 50 USD, полные payment/FX/inventory/audit записи и rollback при недостаточном остатке.
- Staging receipt boundary smoke подтвердил EUR/USD приёмки до/после полуночи Istanbul, корректный FX snapshot, movements, audit и idempotent replay.
- Owner Seller invitation boundary применён и проверен на staging: server-only secret не попадает в browser, приглашение создаёт audit ledger и active Seller membership; повторный запрос идемпотентен, а Owner защищён от понижения роли.
- Backend deactivate/reactivate Seller применён на staging: Owner-only RPC меняет только store membership, audit-логирует переход и лишает blocked Seller доступа через существующие RLS/session guards; production не изменялся.
- Login, Access Denied и Magic Link callback локализованы на English/Turkish; locale сохраняется между страницами, а auth ошибки не раскрывают внутренние детали.

## Следующая задача

- TASK-133 — закрыть оставшиеся Turkish UI gaps. Затем последовательно TASK-134—TASK-136: demo HTTPS preview, owner mobile install test и закрытие PWA gate. TASK-132 и TASK-131 завершены.
- До завершения TASK-136 не начинать TASK-060 или другие задачи основной разработки.
- После закрытия PWA gate следующая задача: TASK-060 — провести accessibility pass.
- TASK-040 — завершить staging Magic Link configuration.
- TASK-022 отложена по прямому указанию владельца продукта и будет завершена отдельно.
- TASK-002 и TASK-111 завершены на staging; TASK-012—TASK-017 подтверждены локально. Production не затрагивался.

## Будущая AI-приёмка — порядок реализации

1. TASK-117 — code-first identity и optional barcode.
2. TASK-119 — receipt document draft schema.
3. TASK-089 — private upload фото/PDF накладной.
4. TASK-090 — OCR/AI provider и privacy policy.
5. TASK-091 — extraction header/lines без stock mutation.
6. TASK-120 — exact catalog matching по `Ürün Kodu`.
7. TASK-118 и TASK-121 — canonical colors и распределение quantities по color/size variants.
8. TASK-092 — source preview, исправление и review.
9. TASK-122 — явное атомарное подтверждение receipt.
10. TASK-093 — retry/concurrency/idempotency suite.

TASK-123 отдельно устраняет hydration mismatch локальных demo/live sessions. Barcode не обязателен ни на одном шаге AI-приёмки.

## Будущая AI-продажа по фото этикеток — порядок реализации

1. TASK-124 — private sale-label image drafts и безопасный batch upload.
2. TASK-125 — extraction brand/code/color/size и optional barcode/QR.
3. TASK-126 — точное store-scoped matching только с in-stock catalog variant.
4. TASK-127 — Camera / Upload labels внутри New Sale с сохранением manual flow.
5. TASK-128 — source preview, confidence и явное добавление подтверждённых matches в cart.
6. TASK-129 — единый Per-item/Total pricing, payments и atomic Sale RPC для manual/AI cart.
7. TASK-130 — privacy, RLS, retry/idempotency, accessibility и mobile E2E suite.

Цена, напечатанная на этикетке, не становится actual sale price. AI не создаёт product, не добавляет ambiguous/out-of-stock item молча и не подтверждает sale без продавца. Barcode не обязателен.

## Список выполненных задач

- До task-based workflow: product discovery и Clothing MVP decisions.
- До task-based workflow: clothing-only visual demo и три раунда UI review.
- До task-based workflow: Supabase foundation, RLS и environment boundary.
- До task-based workflow: Magic Link session и membership guard.
- До task-based workflow: audited receipt/FX foundations и live catalog.
- До task-based workflow: private product-image flow.
- До task-based workflow: atomic sale foundation и initial payment migrations.
- До task-based workflow: выделение `features/workspace`, `catalog`, `exchange-rates`, `seller-goals` и `sales`.
- [TASK-001](tasks/TASK-001.md) — разрешён один variant с разными ценами и валютами в одной sale на уровне migration; требуется staging application в TASK-002.
- [TASK-003](tasks/TASK-003.md) — устранено неявное добавление позиции при Sell.
- [TASK-004](tasks/TASK-004.md) — добавлен безопасный локализованный mapping ошибок sale.
- [TASK-005](tasks/TASK-005.md) — подготовлена native-currency payment RPC migration; runtime staging validation остаётся в TASK-002.
- [TASK-006](tasks/TASK-006.md) — добавлены payment draft types и EUR validation.
- [TASK-007](tasks/TASK-007.md) — добавлен mixed-payment editor.
- [TASK-008](tasks/TASK-008.md) — UI подключён к native-currency live RPC.
- [TASK-009](tasks/TASK-009.md) — добавлены Vitest и React Testing Library.
- [TASK-010](tasks/TASK-010.md) — добавлены demo-sale unit tests.
- [TASK-011](tasks/TASK-011.md) — добавлены Sale Flow component tests.
- [TASK-101](tasks/TASK-101.md) — обычная sale отделена от opt-in Mixed payment editor.
- [TASK-102](tasks/TASK-102.md) — заполненная следующая позиция сразу учитывается в multi-item sale.
- [TASK-103](tasks/TASK-103.md) — повторный variant не учитывается сверх доступного остатка.
- [TASK-104](tasks/TASK-104.md) — Mixed payment перенесён до цены и рассчитывает single-item EUR total автоматически.
- [TASK-105](tasks/TASK-105.md) — утверждена модель общей цены multi-item sale без искусственного распределения выручки по товарам.
- [TASK-106](tasks/TASK-106.md) — добавлена schema migration общей цены sale.
- [TASK-107](tasks/TASK-107.md) — RPC поддерживает атомарную multi-item sale-level оплату.
- [TASK-108](tasks/TASK-108.md) — frontend-модель и live payload поддерживают оба pricing modes.
- [TASK-109](tasks/TASK-109.md) — Sale Flow получил `Per-item price` и `Total sale price`.
- [TASK-110](tasks/TASK-110.md) — добавлены regression tests новой матрицы pricing/payment.
- [TASK-112](tasks/TASK-112.md) — Price Type стал первым шагом, а Mixed payment правильно расположен в обоих режимах.
- [TASK-113](tasks/TASK-113.md) — строки Mixed payment в Per-item price открываются сразу после галочки, до ввода цены.
- [TASK-111](tasks/TASK-111.md) — выполнен авторизованный staging smoke-test общей цены sale, включая audit и rollback.
- [TASK-002](tasks/TASK-002.md) — подтверждена staging sale одного variant строками EUR и USD, payment/FX snapshots и rollback.
- [TASK-012](tasks/TASK-012.md) — добавлен воспроизводимый локальный Supabase/pgTAP harness; чистый reset, migrations и 7 baseline checks дважды прошли успешно.
- [TASK-013](tasks/TASK-013.md) — добавлены изолированные sales RPC integration tests: mixed payments, FX snapshots, repeated lines, atomic rollback, movements и audit; 25 checks дважды прошли с чистой базы.
- [TASK-014](tasks/TASK-014.md) — добавлен Playwright demo smoke runner для desktop и mobile viewport; 2/2 smoke tests и production build проходят.
- [TASK-015](tasks/TASK-015.md) — добавлен desktop/mobile e2e сценарий EUR + USD lines одного variant; полный Playwright demo suite проходит 4/4.
- [TASK-016](tasks/TASK-016.md) — receipt draft и чистая demo stock mutation вынесены в feature; merge/new variant/invalid quantity покрыты tests.
- [TASK-017](tasks/TASK-017.md) — live receipt RPC и localized error mapping вынесены в feature; dashboard refreshes только после success.
- [TASK-018](tasks/TASK-018.md) — Receive Flow перенесён в `features/receipts/ui`; legacy component path удалён.
- [TASK-019](tasks/TASK-019.md) — Receive Flow и его modal chrome полностью локализованы на English/Turkish без сброса draft при смене locale.
- [TASK-020](tasks/TASK-020.md) — receipt feature покрыт 17 тестами: matrix, merge/new variants, validation, live payload и localized errors; полный suite 36/36.
- [TASK-021](tasks/TASK-021.md) — receipt business-date wrapper подтверждён на staging; EUR/USD boundary fixture, movements, audit и idempotency прошли.
- [TASK-023](tasks/TASK-023.md) — Product Card перенесена в `features/catalog/ui`; upload/sell callbacks и fullscreen viewer сохранены.
- [TASK-024](tasks/TASK-024.md) — Product Card полностью локализована на English/Turkish; localized aria/errors и keyboard viewer покрыты tests.
- [TASK-025](tasks/TASK-025.md) — product photos покрыты validation/upload/rollback и carousel/viewer/zoom/pan component tests; полный suite 47/47.
- [TASK-114](tasks/TASK-114.md) — исправлены контраст Light theme, валидация Receive Flow и сортировка нулевых остатков; полный suite 49/49.
- [TASK-115](tasks/TASK-115.md) — восстановлен автоматический расчёт EUR-цены одной позиции из Mixed Payment; полный suite 49/49.
- [TASK-116](tasks/TASK-116.md) — устранено устаревание FX rates перед New Sale; добавлены rate loader tests, полный suite 51/51.
- [TASK-026](tasks/TASK-026.md) — добавлена store-scoped barcode uniqueness migration, indexes и pgTAP coverage; local Supabase suite 32 checks.
- [TASK-027](tasks/TASK-027.md) — optional barcode lookup добавлен и оставлен неактивной возможностью; staging smoke снят с блокирующих критериев по решению владельца.
- [TASK-028](tasks/TASK-028.md) — добавлено обратимое Owner-only archive/restore модели с audit, защитой от sale archived model и Owner archive list; frontend suite 57/57 и production build проходят.
- [TASK-029](tasks/TASK-029.md) — добавлен store/variant-scoped query движений с actor/source normalization, mapper tests и RLS regression fixture; frontend suite 59/59 и production build проходят.
- [TASK-030](tasks/TASK-030.md) — добавлен adaptive Product Card history dialog: selected variant, signed quantity/type/actor/reason, loading/empty/error/retry и Escape close; 64/64 tests, build и desktop/mobile browser smoke проходят.
- [TASK-031](tasks/TASK-031.md) — Owner-only adjustment RPC/UI применены точечно на staging; `+1/-1` reconciliation вернул stock к исходным 3 и записал 2 movements/2 audit records. Production не изменялся.
- [TASK-032](tasks/TASK-032.md) — staging migration начального пересчёта и Owner UI применены/проверены владельцем.
- [TASK-033](tasks/TASK-033.md) — staging supplier directory и Owner UI применены/проверены владельцем.
- [TASK-034](tasks/TASK-034.md) — staging low-stock policy и Owner threshold UI применены/проверены владельцем.
- [TASK-035](tasks/TASK-035.md) — Owner invitation migration и защищённая server boundary применены на staging; live invite email smoke пройден.
- [TASK-036](tasks/TASK-036.md) — Owner invite Seller form подключена к live boundary, локализована и подтверждена staging smoke-test.
- [TASK-037](tasks/TASK-037.md) — Owner-only Seller deactivate/reactivate RPC, server route и local RLS/idempotency coverage; migration применена на staging.
- [TASK-039](tasks/TASK-039.md) — локализованы login/access-denied/callback, locale сохраняется и error redirects безопасны.
- [TASK-044](tasks/TASK-044.md) — добавлен pgTAP RLS regression suite для Owner/Seller/cross-store/anonymous boundaries и прямых writes.
- [TASK-045](tasks/TASK-045.md) — добавлены общие доступные form controls/error presenter; Invite Seller переведён на primitives.
- [TASK-051](tasks/TASK-051.md) — Seller list, invite и status actions объединены в Owner-only SellerManager с явными source adapters.
- [TASK-053](tasks/TASK-053.md) — добавлен versioned, safe-parsed demo persistence adapter с reset к mock baseline.
- [TASK-046](tasks/TASK-046.md) — зафиксированы design tokens/adaptive rules; browser smoke покрывает Light theme и desktop/tablet/mobile.
- [TASK-047](tasks/TASK-047.md) — navigation, header и workspace shell вынесены в layout components с явными props/callbacks.
- [TASK-048](tasks/TASK-048.md) — KPI, chart, Seller ranking и goal composition вынесены в read-only Overview feature.
- [TASK-049](tasks/TASK-049.md) — search, pagination и selection inventory вынесены в InventoryList.
- [TASK-050](tasks/TASK-050.md) — compact/full Activity Feed и currency formatting вынесены в feature.
- [TASK-052](tasks/TASK-052.md) — добавлены стабильные dashboard URLs, direct-link smoke coverage и mobile navigation transition.
- [TASK-054](tasks/TASK-054.md) — demo workspace сохраняет inventory, sales, sellers и activity между reload; добавлен явный reset.
- [TASK-055](tasks/TASK-055.md) — добавлены transport-independent session и workspace DTO, server-side session mapper и fixtures.
- [TASK-056](tasks/TASK-056.md) — добавлены catalog/receipt/inventory DTO и commands, подключённые к live adapters.
- [TASK-057](tasks/TASK-057.md) — добавлены sale/payment contracts, explicit money tolerance/idempotency и lifecycle DTO.
- [TASK-058](tasks/TASK-058.md) — завершён Turkish pass для overview/low-stock states и locale-aware KPI formatting.
- [TASK-059](tasks/TASK-059.md) — добавлены standalone manifest, maskable branding icons и install-safe metadata без offline promise.
- [TASK-131](tasks/TASK-131.md) — добавлены explicit Android/iOS PNG install assets, manifest/metadata checks и reproducible icon generator.
- [TASK-132](tasks/TASK-132.md) — восстановлена visual parity Overview после i18n refactor с сохранением locale-aware formatting.

## Список оставшихся задач

- [TASK-022](tasks/TASK-022.md) — Применить product-images migration на staging
- [TASK-038](tasks/TASK-038.md) — Добавить Seller status management UI
- [TASK-040](tasks/TASK-040.md) — Завершить staging Magic Link configuration
- [TASK-041](tasks/TASK-041.md) — Добавить store-scoped audit log query
- [TASK-042](tasks/TASK-042.md) — Добавить Owner Audit Log UI
- [TASK-043](tasks/TASK-043.md) — Добавить server validation и rate limiting
- [TASK-133](tasks/TASK-133.md) — Закрыть оставшиеся Turkish UI gaps
- [TASK-134](tasks/TASK-134.md) — Развернуть demo HTTPS preview для PWA
- [TASK-135](tasks/TASK-135.md) — Проверить установку PWA на телефоне
- [TASK-136](tasks/TASK-136.md) — Исправить PWA preview findings и закрыть gate
- [TASK-060](tasks/TASK-060.md) — Провести accessibility pass
- [TASK-061](tasks/TASK-061.md) — Провести desktop/tablet/mobile browser QA
- [TASK-062](tasks/TASK-062.md) — Добавить Sales History view
- [TASK-063](tasks/TASK-063.md) — Добавить атомарную cancellation RPC
- [TASK-064](tasks/TASK-064.md) — Добавить Cancellation UI
- [TASK-065](tasks/TASK-065.md) — Добавить атомарную exchange RPC
- [TASK-066](tasks/TASK-066.md) — Добавить Exchange UI
- [TASK-067](tasks/TASK-067.md) — Добавить Seller sales history filters
- [TASK-068](tasks/TASK-068.md) — Добавить reporting metrics API
- [TASK-069](tasks/TASK-069.md) — Добавить report period и custom range
- [TASK-070](tasks/TASK-070.md) — Добавить report breakdown dimensions
- [TASK-071](tasks/TASK-071.md) — Добавить inventory turnover и low-stock report
- [TASK-072](tasks/TASK-072.md) — Добавить Owner Reports UI
- [TASK-073](tasks/TASK-073.md) — Добавить CSV export reports
- [TASK-074](tasks/TASK-074.md) — Добавить XLSX export reports
- [TASK-075](tasks/TASK-075.md) — Добавить PDF export reports
- [TASK-076](tasks/TASK-076.md) — Добавить reconciliation/discrepancy report
- [TASK-077](tasks/TASK-077.md) — Добавить concurrent inventory integration tests
- [TASK-078](tasks/TASK-078.md) — Добавить CI pipeline
- [TASK-079](tasks/TASK-079.md) — Развернуть отдельный staging frontend
- [TASK-080](tasks/TASK-080.md) — Добавить observability и error monitoring
- [TASK-081](tasks/TASK-081.md) — Настроить автоматические backups
- [TASK-082](tasks/TASK-082.md) — Провести restore rehearsal и rollback plan
- [TASK-083](tasks/TASK-083.md) — Создать production Supabase и Vercel projects
- [TASK-084](tasks/TASK-084.md) — Настроить production Auth SMTP и redirects
- [TASK-085](tasks/TASK-085.md) — Провести production migration rehearsal
- [TASK-086](tasks/TASK-086.md) — Подготовить pilot runbook и обучение
- [TASK-087](tasks/TASK-087.md) — Загрузить начальный clothing inventory
- [TASK-088](tasks/TASK-088.md) — Запустить clothing pilot и ежедневную сверку
- [TASK-089](tasks/TASK-089.md) — Добавить upload фото/PDF накладной
- [TASK-090](tasks/TASK-090.md) — Выбрать OCR/AI provider и privacy policy
- [TASK-091](tasks/TASK-091.md) — Добавить OCR extraction draft service
- [TASK-092](tasks/TASK-092.md) — Добавить UI проверки OCR draft
- [TASK-093](tasks/TASK-093.md) — Добавить idempotency tests обработки документов
- [TASK-094](tasks/TASK-094.md) — Выделить общий application API для web и Telegram
- [TASK-095](tasks/TASK-095.md) — Адаптировать Telegram bot к общему API
- [TASK-096](tasks/TASK-096.md) — Проверить Telegram idempotency и consistency
- [TASK-097](tasks/TASK-097.md) — Включить Zebra Steps и Zebra Bags
- [TASK-098](tasks/TASK-098.md) — Добавить backend transfer между магазинами
- [TASK-099](tasks/TASK-099.md) — Добавить Transfer UI
- [TASK-100](tasks/TASK-100.md) — Провести multi-store rollout и reconciliation
- [TASK-117](tasks/TASK-117.md) — Зафиксировать code-first product identity и optional barcode
- [TASK-118](tasks/TASK-118.md) — Нормализовать цвета и удалить staging test fixtures
- [TASK-119](tasks/TASK-119.md) — Добавить domain model черновика накладной
- [TASK-120](tasks/TASK-120.md) — Сопоставлять строки накладной с catalog по Product code
- [TASK-121](tasks/TASK-121.md) — Распределить invoice quantity по color/size variants
- [TASK-122](tasks/TASK-122.md) — Атомарно подтвердить AI receipt draft
- [TASK-123](tasks/TASK-123.md) — Устранить hydration mismatch при локальной отладке
- [TASK-124](tasks/TASK-124.md) — Добавить private sale-label image drafts
- [TASK-125](tasks/TASK-125.md) — Извлекать данные с товарной этикетки
- [TASK-126](tasks/TASK-126.md) — Сопоставлять этикетку с in-stock catalog variant
- [TASK-127](tasks/TASK-127.md) — Добавить Camera / Upload labels в New Sale
- [TASK-128](tasks/TASK-128.md) — Добавить review распознанных этикеток перед cart
- [TASK-129](tasks/TASK-129.md) — Интегрировать label cart с обычным подтверждением sale
- [TASK-130](tasks/TASK-130.md) — Проверить безопасность и качество AI label sale

## Известные проблемы

- Product-images migration применена и RLS/reload подтверждены, но fresh valid upload и MIME/oversize smoke заблокированы настройкой **Allow access to file URLs** в ChatGPT Chrome extension; TASK-022 остаётся pending.
- Barcode migration подготовлена и прошла только local Supabase verification; до staging/production она должна быть пересмотрена в TASK-117 под code-first/optional-barcode policy.
- Новая archive migration не применялась на staging/production. pgTAP-команды были запущены, но текущий local Supabase CLI не вернул итоговый вывод; повторить `npm run supabase:verify` в доступном Docker/local Supabase окружении перед staging apply.
- Receive Flow содержит загрязнённые staging color suggestions (`Boundary EUR/USD`, case/EN/TR duplicates); безопасный audit, normalization и cleanup вынесены в TASK-118.
- SSR/первый client render `Home` теперь используют детерминированный demo shell, а live mode включается после hydration; browser console smoke и изоляция dev build outputs всё ещё остаются в TASK-123.
- Turkish покрытие неполное вне Sale Flow.
- Explicit Android/iOS PNG install assets и local manifest validation завершены в TASK-131; remote HTTPS validation и physical-device install остаются в TASK-134—TASK-136.
- Нет e2e/RLS/concurrency tests и CI.
- `app/page.tsx` остаётся перегруженным; routing и demo persistence не завершены.
- Cancellation, exchange, reports, audit UI и initial inventory не готовы; следующим шагом Seller deactivate/reactivate.
- В staging остаются legacy/test color values. UI скрывает и нормализует их; удаление/merge данных разрешается только после отдельного read-only audit и подтверждения владельца (TASK-118).
- Production projects, SMTP, monitoring, backup/restore и pilot launch не настроены.
