# Changelog

## 2026-08-15

- TASK-081 assessed the real staging backup boundary. Supabase Dashboard confirms the staging project is Free Plan with no scheduled database backups or artifacts; native database backups also exclude Storage objects, so `product-images` needs its own encrypted off-site mirror. Added `docs/operations/BACKUP.md` with required retention/access policy and two safe implementation options. The task is blocked only on Owner choice of plan/automation and private archive location; no secrets or production resources were accessed.
- Completed TASK-147 full staging acceptance. Owner approved and executed cancellation of four test sales through the audited Owner UI with reason `TASK-147 staging cleanup`; the immutable sales history and stock reversals remain intact. The final Owner reconciliation has 0 payment mismatch, 0 missing sale movement and 0 negative balance. Owner accepted the 11 existing manual-correction review rows as expected staging fixtures (D-058), so no ledger history was rewritten. Production was not changed; TASK-081 backups is next.
- TASK-147 began its fresh staging acceptance pass. Migration history is synchronized at 29 IDs and Owner reload confirms TASK-118 cleanup in Inventory. Reconciliation has no missing sale movements or negative balances, but reports four confirmed sales with €640 expected/captured €0 plus 11 manual-correction review records. The task remains in progress awaiting an Owner decision; no staging records were changed and Production was not touched.
- Completed TASK-118 staging color cleanup. Owner-approved fixture `TASK021-FX-BOUNDARY` was reversibly archived through the Owner flow, preserving 4 movements, 2 receipt lines and 2 sale lines; no physical delete occurred. Migration `20260815120000` adds server-side canonical receipt colours and normalized exactly 13 audited staging variants with audit records. Reconciliation confirmed fixture inactive, 13/13 canonical colours, zero active temporary markers and preserved ledger; Inventory reload hides the fixture and shows `AS123` as Blue. Clean local 29-migration pgTAP passes 14 files/175 assertions, concurrency and demo build pass. Production was not changed.
- TASK-118 staging read-only audit completed without changing data. Fixture model `TASK021-FX-BOUNDARY` has two `Boundary EUR/USD` variants and zero ledger balance, but four movements, two receipt lines and two sale lines, so deletion is unsafe and only reversible archive is proposed. Thirteen `mavi`/`siyah`/`Bej` legacy variants across `AS123`, `USD123` and `XX123` have no canonical `(model, size, color)` collisions and are eligible for a separately approved transactional normalization. TASK-118 remains in progress pending the Owner's exact choice; Production was not changed.
- Completed TASK-038 staging Seller status acceptance. Owner UI changed a staging Seller from active to blocked and back to active, with the opposite action shown after each request; the Seller was restored before completion. At 390×844 the Seller dialog kept status/action within its own bounds without horizontal overflow or console errors. Seller component suites pass 4 tests and the live build passes; production was not changed.
- Completed TASK-022 staging product-image acceptance. An Owner uploaded fresh JPEG, PNG and WebP repository fixtures to a previously photo-less live product; carousel navigation reached 2/3 and still showed 1/3 after reload. Unsupported MIME and a 9 MiB PNG were rejected before Storage upload. Earlier private bucket/RPC/RLS and cross-store-denial evidence remains valid; no production resources changed. Product-image/Product Card suites pass 15 tests and the live build passes.
- Completed TASK-080 safe observability. Added opt-in, provider-neutral structured client/server error capture, a redacting global error boundary, Node instrumentation and a bounded rate-limited endpoint available before sign-in. Sale, receipt and Magic Link failures now carry only safe operation/correlation context. Full local suite passes 80 files/187 tests; demo/live builds and lint (0 errors) pass. A Vercel Preview synthetic event returned 204 and runtime logs retained environment/operation/path while redacting the synthetic email and Bearer value. Preview-only observability was enabled; no production resources, real transactions or Magic Link emails were changed.

## 2026-08-14

- Completed TASK-146 staging RC migration synchronization. A schema-only public checkpoint was created before change; 17 verified historical migrations missing only from remote history were repaired as applied, then exactly eight RC migrations (barcode/archive, reporting/reconciliation, Seller summary and code-first identity) were applied. Staging now has all 28 local/remote migration IDs and a zero-change dry-run. Owner/Seller RPC/RLS smoke, Seller denial of Owner-only reconciliation, sale/receipt RPC sanity and live no-mock health pass. Production was not changed; managed backup/restore remains TASK-081/TASK-082.
- Completed TASK-079 separate staging frontend. A clean archive of `main` RC `81701be` is deployed as a Vercel Preview at `https://zebra-inventory-sales-51z34xyje-cooloxs-projects.vercel.app` with live-only Preview variables pointing to staging Supabase; no values were read or committed. Staging Site URL and `/auth/callback` allow-list now match this Preview. Protected-route/login/session and 390 px mobile no-overflow smoke pass with no console errors; no Magic Link email was sent. Production resources were not configured or changed.
- Completed TASK-145 Clothing Pilot Release Candidate. Code RC `f838f78680b4fb5a18fd5600f194ec5defd335a6` passed local lint (0 errors), demo/live builds, 75 Vitest files/177 tests, Playwright 57/57, clean 28-migration Supabase suite (13 pgTAP files/169 assertions) and all concurrency conflicts. GitHub Actions run `31822493717` is green for Frontend and Local Supabase; the reviewed branch was merged into `main`. Staging and production were not changed; TASK-079 is next.
- Completed TASK-144 targeted EN/TR release pass. Supplier Manager now has localized controls and safe localized errors; Supplier and Count Owner controls were restored from an unreachable legacy block into the active Inventory header. FX entry/base/close labels and Inventory unit labels are localized, state survives locale switches, and Owner/Seller local desktop/mobile smoke passes without mobile horizontal overflow. Full 75-file/177-test suite, demo/live builds and lint (0 errors) pass; staging/production were not changed.
- Completed TASK-117 code-first product identity hardening locally. Product codes are now non-blank and normalized store-unique while preserving stored leading-zero/alphanumeric values; UUIDs remain the only inventory/history references. Receipt now separates an optional shared model barcode from an optional per-colour/size supplier barcode, and raw QR URI/card payloads are rejected pending a decode-and-validate scanner flow. The new migration retains existing barcodes and has clean local evidence: 28 migrations, 13 pgTAP files/169 assertions, 173 frontend tests, lint with 0 errors, and demo/live builds pass. Staging and production were not changed.
- Restored the database release gate by correcting the Seller sales-summary pgTAP fixture to satisfy the required cancellation snapshot, without weakening RLS or assertions. A clean local reset passed all 27 migrations, 13 pgTAP files/162 assertions and the three concurrency conflicts; GitHub Actions run `31816406792` is green for both Frontend and Local Supabase checks on commit `8c5c81f`.
- Stabilized the frontend release gate: replaced interactive `next lint` with pinned ESLint 9 flat-config tooling and added it to CI, made the axe modal check wait for the final animation state, and documented `tmp/` as ignored local visual-QA output without deleting existing files. Lint has 0 errors, 172 frontend tests and demo/live builds pass, and two consecutive full Playwright runs pass 57/57 without retries.
- Added an explicit cross-chat handoff protocol: `PROJECT_STATUS.md` is the single current-task pointer, `ROADMAP.md` tracks every launch step as DONE/NEXT/WAITING/PARTIAL/BLOCKED, and Owner starts one task with `Выполни TASK-NNN`. Agents mark the task IN PROGRESS before work, record evidence on completion, advance exactly one pointer and stop until the next explicit command.
- Replaced the stale implementation roadmap with one audited Clothing Pilot launch plan. Existing completed task files remain historical evidence; AI receipt, Telegram, AI labels and multi-store are explicitly post-launch. Added TASK-142—TASK-151 only for genuine release gaps: frontend/database gates, remaining EN/TR, RC freeze, staging migration/acceptance, security capacity smoke, Go/No-Go, production deploy and pilot closure. The audit records 172 frontend tests, 57 browser checks, 27 migrations and 162 SQL assertions, and correctly marks current-head CI as frontend-green/database-red rather than reusing an older green run.
- Added a compact Seller-only sales summary to the dashboard: live store today/week plus personal today/week/month/year/all-time EUR revenue and units. It uses the protected TASK-140 RPC only, never substitutes demo sales data, refreshes after sale/cancellation/exchange workspace updates, and includes EN/TR loading, empty and retry states. Owner reports remain separate. 172 frontend tests, build and Seller desktop/tablet/mobile smoke pass; staging/production were not changed.
- Added a secure Seller sales-summary RPC: active-store today/week aggregates and personal today/week/month/year/all-time EUR revenue and units. It derives personal attribution from `auth.uid()`, excludes cancelled sales, reconciles exchange top-ups to the source sale and uses Istanbul/Wed–Tue business periods. Local Supabase/RLS, 168 frontend tests and production build pass; staging/production were not changed.
- Added compact private-model photo thumbnails and purchase cost to Inventory rows for Seller and Owner. Items without photos now have an accessible localized placeholder; Product Card continues to show only the non-persisted sell-price reference. Full unit/build and desktop-tablet-mobile smoke coverage passes.
- Recorded the Owner decision to add private-model thumbnails and purchase cost in Inventory while keeping purchase cost out of Product Card, plus a server-authorized Seller sales summary: store today/week and personal today/week/month/year/all-time totals. Work is split into TASK-139—TASK-141.
- Confirmed that Product Card sell price remains a non-persisted `purchase cost × 3` reference; Seller may still enter the actual sale price for each transaction.
- Configured the staging Magic Link Preview: Vercel Preview now uses live mode with the matching build command/output directory, and Supabase Site URL plus callback allow-list target the working branch Preview while retaining localhost development callback.
- Disabled Vercel Authentication for the staging Preview so mobile Magic Links reach Zebra rather than the Vercel sign-in page; unauthenticated HTTP check of the staging login returns 200.
- Completed staging Magic Link verification: Owner and invited Seller sign in through separate accounts, unknown email is denied, used links do not authenticate again, and logout/refresh retains the membership boundary; Owner confirmed the mobile flow.
- Completed GitHub Actions CI verification on the public repository: the final remote run passes frontend build/unit/component/desktop-tablet-mobile smoke plus clean local Supabase migrations, RLS and concurrency checks. The workflow now starts its isolated Supabase stack explicitly; responsive test selectors and report-table keyboard access were corrected.
- Isolated local demo/live Next.js modes with explicit mode selection and separate `.next-demo`/`.next-live` output directories. Added safe mode-specific commands, a production hydration console assertion and clean sequential Chrome smoke; demo and live both load without hydration diagnostics.
- Added a server-side validation and rate-limit boundary for Seller invitation, Seller access changes and session reads. Malformed/oversized external payloads are rejected before privileged actions; API errors use safe domain codes without exposing provider/RPC messages or client PII. Full Vitest suite passes 165/165 and production build passes.

## 2026-08-13

- Published the GitHub Actions CI workflow and created the first remote run. GitHub blocked it before jobs began because the account billing is locked; TASK-078 remains in progress pending Billing & plans resolution and a green rerun.
- Audited task accounting across all 138 TASK files: restored completed TASK-041/042 to `PROJECT_STATUS`, documented the remaining UI smoke boundary for TASK-038 and the fresh-upload/negative-smoke boundary for TASK-022.
- Added a store-scoped Owner audit-log query with normalized event categories, safe actor-name mapping, stable filters/pagination and RLS cross-store coverage.
- Added a GitHub Actions CI pipeline: production build, unit/component tests, deterministic desktop/tablet/mobile Playwright smoke, clean Supabase migrations/RLS checks and concurrent inventory harness run separately without production secrets.
- Added the Owner Audit Log UI: filters for category/actor/entity/date, pagination and safe operation details; Seller remains limited to Activity rather than audit data.
- Added Owner-only XLSX reports export with a typed Summary and requested Breakdown worksheet, real Excel date/money cells, formula-prefix neutralization, filter parity and server authorization coverage.
- Added persistent demo sale-exchange snapshots: a positive top-up now increases Overview/report revenue, chart and Seller ranking while keeping one ticket/unit; margin replaces the returned item's cost, and Sales History shows the replacement and final ticket total.
- Fixed demo exchange payment options to show each currency's actual FX-equivalent top-up before selection. Demo Owner Reports now derive from local sales, cancellations, exchanges and inventory and refresh after those changes; Seller no longer sees the empty Owner-only Reports block.
- Added local-only real concurrent inventory transaction harness for sale/sale, sale/adjustment and sale/exchange conflicts; each clean run proves one rejection and non-negative ledger balances.
- Added Owner-only reconciliation report for payment mismatches, missing sale movements, negative balances and manual inventory corrections, including source IDs, RLS, clean-ledger coverage and Reports UI states.
- Added Owner-only PDF report export with compact landscape metrics/breakdown layout, store/period/generated timestamp, long-table pagination, UI action and authorization coverage.
- Added Owner/Seller sales-history filters for seller, status and Wednesday–Tuesday business period. Filters persist in URL query state; unit/component and direct-link browser coverage pass.
- Added store-scoped EUR reporting metrics RPC and typed loader. Confirmed sales, cancelled reversals and exchange top-ups reconcile through local pgTAP RLS fixtures; staging and production were not changed.
- Added Istanbul business-date reporting periods: Today, Wednesday–Tuesday week, month, year and validated custom ranges. The inclusive `{ from, to }` contract now reaches the reporting RPC and loader.
- Added store-scoped Seller, supplier, brand, model and category report breakdowns. EUR totals reconcile with the primary report; archived entities remain visible in historical results.
- Added ledger-derived inventory reporting by model/variant: historical balance, sold units, sell-through, turnover and configured low-stock status, with zero-safe calculations.
- Added Owner Reports at `/reports`: responsive metrics, period filters, dimension drill-down and low-stock table with live loading/error states.
- Added Owner-only UTF-8 CSV export for summary, breakdown and inventory reports, with filter parity, RFC 4180 escaping and formula-injection neutralization.

## 2026-08-11

- Added staged-ready inventory count documents with atomic, idempotent adjustment reconciliation and an Owner count form.
- Added Owner supplier directory create/edit/archive UI and auditable supplier RPCs that preserve historical receipts.
- Added store/model low-stock policies, real-balance query, Owner threshold control and policy-aware attention carousel.

## 2026-08-12

- Added Exchange UI from confirmed per-item sale history: in-stock replacement picker, clear top-up/no-refund policy, native-currency payment confirmation and live/demo refresh. Applied exchange migration to staging; €10 top-up smoke confirmed paired movements, payment snapshot, audit and idempotent replay. Production was not changed.
- Added atomic exchange ledger/RPC: source-sale-line traceability, locked `exchange_in`/`exchange_out` stock movements, native top-up payment snapshots and required audit/reason. Cheaper/equal exchanges never create refunds or credits; full local pgTAP (114 checks) passes. Staging and production were not changed.
- Added reason-required Cancellation UI for confirmed sales, with focused mobile confirmation dialog, localized loading/error/success states, live workspace refresh and demo stock reversal. Applied the audited cancellation migration to staging; authenticated smoke confirmed sale status/reason/timestamp, exact stock reversal, reversed payments and audit record. Production was not changed.
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
- Closed the PWA mobile gate after the Owner re-verified Android/iOS installation, the new icon, standalone launch and core demo flows on the Vercel HTTPS preview.
- Completed the accessibility pass: dialogs and mobile navigation now manage keyboard focus correctly, status messages are announced, Light/Dark contrast tokens were strengthened, and axe/keyboard/reduced-motion browser coverage was added.
- Completed desktop/tablet/iPhone/Android viewport QA with no new visual or interaction findings; local production browser console stayed clean and previous Owner physical-device evidence remains valid.
- Added a store-scoped Sales History view with paginated localized details, seller/status/product information and original-currency payment snapshots without recalculating historical FX.
- Added an atomic, auditable sale cancellation RPC: Seller store access and mandatory reason are enforced server-side, stock is restored through reversal movements, payment snapshots become reversed, and duplicate requests are idempotent.
