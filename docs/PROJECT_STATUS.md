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
- Supabase staging Auth направляет Magic Link на работающий branch Preview `zebra-inventory-sales-git-review-task-060-077-cooloxs-projects.vercel.app`; localhost callback сохранён. На Vercel Preview заданы live Supabase variables и согласованы `npm run build:live` / `.next-live`; Vercel Authentication для Preview отключена, внешний запрос к `/login` возвращает HTTP 200. Перед сменой branch Preview этот URL нужно заменить.

## Следующая задача

- PWA gate закрыт: Owner повторно подтвердил Android/iOS install, новую чёрно-белую zebra `Z`, standalone launch, основные flows и EN/TR на Vercel HTTPS preview. TASK-131—TASK-136 завершены.
- TASK-043 завершена локально: Seller invite/status и session получили единый runtime validation boundary, safe domain errors и scoped rate limits; 165/165 tests и production build проходят. Staging/production не изменялись.
- TASK-123 завершена локально: demo/live mode теперь explicit и изолированы по `.next-demo`/`.next-live`; Chrome smoke и production hydration assertion не нашли hydration diagnostics. Staging/production не изменялись.
- TASK-078 завершена: GitHub account billing block снят, а `CI #3` (run `31751839301`, commit `b75d1d0`) зелёный для frontend и clean local Supabase jobs. CI не использует production/staging secrets.
- TASK-040 завершена на staging: Owner/Seller/unknown-email/used-link/logout/refresh/mobile matrix подтверждена владельцем; Vercel Authentication отключена для Preview.
- Следующая задача — TASK-079; не начинать её без новой команды владельца.
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

TASK-123 завершена: локальные demo/live sessions изолированы и не дают hydration mismatch. Barcode не обязателен ни на одном шаге AI-приёмки.

## Будущая AI-продажа по фото этикеток — порядок реализации

1. TASK-124 — private sale-label image drafts и безопасный batch upload.
2. TASK-125 — extraction brand/code/color/size и optional barcode/QR.
3. TASK-126 — точное store-scoped matching только с in-stock catalog variant.
4. TASK-127 — Camera / Upload labels внутри New Sale с сохранением manual flow.
5. TASK-128 — source preview, confidence и явное добавление подтверждённых matches в cart.
6. TASK-129 — единый Per-item/Total pricing, payments и atomic Sale RPC для manual/AI cart.
7. TASK-130 — privacy, RLS, retry/idempotency, accessibility и mobile E2E suite.

Цена, напечатанная на этикетке, не становится actual sale price. AI не создаёт product, не добавляет ambiguous/out-of-stock item молча и не подтверждает sale без продавца. Barcode не обязателен.

## Сводка учёта задач

- Всего TASK-файлов: 138.
- Завершено: 101; pending: 34; in progress: 1 (`TASK-118`).
- Все 138 TASK представлены ровно один раз в списках ниже; сверка выполнена 2026-08-14.

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
- [TASK-123](tasks/TASK-123.md) — устранён hydration mismatch при локальной отладке: явные demo/live modes, отдельные build outputs и browser console assertion.
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
- [TASK-040](tasks/TASK-040.md) — staging Magic Link configuration завершена: Preview public, redirects согласованы; Owner/Seller/unknown/used-link/logout/mobile matrix подтверждена владельцем.
- [TASK-041](tasks/TASK-041.md) — добавлен store-scoped Owner audit-log query с безопасным actor mapping, filters/pagination и RLS cross-store coverage.
- [TASK-042](tasks/TASK-042.md) — добавлен Owner Audit Log UI с фильтрами, pagination, safe details и Owner/Seller boundary.
- [TASK-043](tasks/TASK-043.md) — добавлены единые runtime validation и rate-limit boundaries для Seller invite/status и session; API errors безопасны, 165/165 tests и build проходят.
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
- [TASK-133](tasks/TASK-133.md) — локализованы preview-critical Audit Log, Seller Goal, modal/access states и navigation labels; добавлены Turkish component/browser smoke checks.
- [TASK-134](tasks/TASK-134.md) — создан изолированный Vercel demo HTTPS preview, без Supabase/VPS/production, с remote manifest и desktop/mobile smoke checks.
- [TASK-135](tasks/TASK-135.md) — Owner подтвердил Android/iOS installation и standalone launch; единственный finding — замена визуальных PWA icons в TASK-136.
- [TASK-136](tasks/TASK-136.md) — обновлены PWA icons; Owner повторно подтвердил Android/iOS install, standalone flow и ключевую navigation на Vercel HTTPS preview. PWA gate закрыт.
- [TASK-060](tasks/TASK-060.md) — проведён accessibility pass: dialog focus lifecycle, mobile drawer semantics, status announcements, contrast tokens, reduced motion и axe/keyboard browser coverage.
- [TASK-061](tasks/TASK-061.md) — desktop/tablet/iPhone/Android QA пройдён без новых defects; navigation, catalog, Sale, Receive, themes и locale имеют browser/physical-device evidence.
- [TASK-062](tasks/TASK-062.md) — добавлен store-scoped Sales History с snapshots, pagination, localized detail/empty states и browser coverage.
- [TASK-063](tasks/TASK-063.md) — добавлена атомарная, reason-required cancellation RPC с payment reversal snapshots, stock ledger reversal, audit и local pgTAP RLS/idempotency coverage.
- [TASK-064](tasks/TASK-064.md) — добавлен Cancellation UI с обязательной причиной, confirmation/loading/error states, live/demo refresh и mobile coverage; cancellation migration применена и проверена на staging.
- [TASK-065](tasks/TASK-065.md) — добавлен атомарный exchange ledger/RPC с source-line traceability, stock reversal/outbound, native top-up snapshots, no-refund policy, RLS/idempotency/audit и local pgTAP coverage.
- [TASK-066](tasks/TASK-066.md) — добавлен Exchange UI с in-stock picker, explicit top-up/no-refund policy, native payment confirmation и workspace refresh; migration и atomic staging smoke подтверждены.
- [TASK-067](tasks/TASK-067.md) — добавлены Owner/Seller sales-history filters, Wednesday–Tuesday business week, URL query state и role/direct-link tests.
- [TASK-068](tasks/TASK-068.md) — добавлен store-scoped EUR reporting metrics RPC и typed adapter; cancellation/exchange reconciliation и RLS покрыты локальным pgTAP.
- [TASK-069](tasks/TASK-069.md) — добавлен единый Istanbul business-date period contract и custom range validation; reporting RPC принимает inclusive range.
- [TASK-070](tasks/TASK-070.md) — добавлены Seller/supplier/brand/model/category EUR breakdowns с total reconciliation, historical archived entities и RLS coverage.
- [TASK-071](tasks/TASK-071.md) — добавлен ledger-derived inventory report по model/variant: balance, sell-through, turnover и configured low-stock.
- [TASK-072](tasks/TASK-072.md) — добавлен Owner-only Reports UI на `/reports`: period, metrics, dimensions, low-stock и live-safe states.
- [TASK-073](tasks/TASK-073.md) — добавлен Owner-only UTF-8 CSV export reports с filter parity, formula-injection protection и API authorization coverage.
- [TASK-074](tasks/TASK-074.md) — добавлен Owner-only XLSX export: typed Summary/Breakdown workbook, period/filter parity, formula-prefix neutralization и authorization coverage.
- [TASK-075](tasks/TASK-075.md) — добавлен Owner-only PDF export reports: compact landscape A4 metrics/breakdown, pagination, filter parity и API authorization coverage.
- [TASK-076](tasks/TASK-076.md) — добавлен Owner-only reconciliation report для payment/movement/balance discrepancies и manual corrections с source IDs и RLS coverage.
- [TASK-077](tasks/TASK-077.md) — добавлен local-only harness реальных concurrent inventory transactions для sale/adjustment/exchange с clean-run coverage.
- [TASK-078](tasks/TASK-078.md) — GitHub Actions CI подтверждён зелёным remote run: frontend build/tests/Playwright и isolated clean Supabase migrations/RLS/concurrency jobs.
- [TASK-137](tasks/TASK-137.md) — исправлены preview QA: эквиваленты валют в exchange top-up, живые demo Reports и скрытие Reports для Seller.
- [TASK-138](tasks/TASK-138.md) — exchange top-up хранится как часть исходного чека и учитывается в общей выручке, графике, Seller ranking, Owner Reports и Sales History без увеличения tickets/units.

## Список оставшихся задач

- [TASK-022](tasks/TASK-022.md) — Завершить fresh upload и MIME/oversize smoke для staging product images
- [TASK-038](tasks/TASK-038.md) — Подтвердить Seller status UI через staging visual и mobile smoke
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
- [TASK-124](tasks/TASK-124.md) — Добавить private sale-label image drafts
- [TASK-125](tasks/TASK-125.md) — Извлекать данные с товарной этикетки
- [TASK-126](tasks/TASK-126.md) — Сопоставлять этикетку с in-stock catalog variant
- [TASK-127](tasks/TASK-127.md) — Добавить Camera / Upload labels в New Sale
- [TASK-128](tasks/TASK-128.md) — Добавить review распознанных этикеток перед cart
- [TASK-129](tasks/TASK-129.md) — Интегрировать label cart с обычным подтверждением sale
- [TASK-130](tasks/TASK-130.md) — Проверить безопасность и качество AI label sale

## Известные проблемы

- Product-images migration применена, а private bucket/RPC/RLS, cross-store denial и carousel reload подтверждены. TASK-022 остаётся pending: ранее загруженные records не заменяют fresh valid upload; также не выполнены MIME/oversize rejection smoke. Текущий browser-путь заблокирован настройкой **Allow access to file URLs** в ChatGPT Chrome extension.
- Seller status UI фактически реализован в TASK-051: Owner actions, Seller boundary и optimistic rollback подтверждены 4/4 component tests. TASK-038 остаётся pending только до зафиксированных staging visual и mobile layout smoke; backend staging smoke TASK-037 не закрывает UI-критерии.
- Barcode migration подготовлена и прошла только local Supabase verification; до staging/production она должна быть пересмотрена в TASK-117 под code-first/optional-barcode policy.
- Новая archive migration не применялась на staging/production. pgTAP-команды были запущены, но текущий local Supabase CLI не вернул итоговый вывод; повторить `npm run supabase:verify` в доступном Docker/local Supabase окружении перед staging apply.
- Receive Flow содержит загрязнённые staging color suggestions (`Boundary EUR/USD`, case/EN/TR duplicates); безопасный audit, normalization и cleanup вынесены в TASK-118.
- Turkish покрытие preview-critical Audit Log, Seller Goal и modal/access states завершено; owner-only Supplier/FX и часть inventory controls требуют отдельного полного i18n pass.
- PWA preview gate и desktop/tablet/mobile QA закрыты: Vercel HTTPS preview, Android/iOS physical-device smoke и local viewport matrix подтверждены.
- Repository visibility изменена на public для бесплатных standard GitHub runners. CI workflow опубликован и распознан, но run `31717664237` также остановлен до jobs из-за GitHub account billing lock. Frontend/database jobs ещё не получили remote evidence; E2E, RLS и concurrency suites включены без production secrets. После снятия account lock повторно запустить run.
- `app/page.tsx` остаётся перегруженным; routing и demo persistence не завершены.
- XLSX export завершён без новой production-зависимости: server-side structural checks подтверждают workbook/sheet XML. В текущем окружении нет LibreOffice, поэтому его visual open smoke выполняется в Owner live browser после скачивания.
- В staging остаются legacy/test color values. UI скрывает и нормализует их; удаление/merge данных разрешается только после отдельного read-only audit и подтверждения владельца (TASK-118).
- Production projects, SMTP, monitoring, backup/restore и pilot launch не настроены.
