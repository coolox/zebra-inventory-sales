# TASK-165 — Собрать shared staging Preview и провести Owner/Seller mobile walkthrough

Статус: IN PROGRESS

Источник: Owner-approved remediation path, 2026-08-20.

## Цель

Опубликовать один staging Preview из reviewed remediation set и подтвердить на
physical iPhone и Android, что Owner/Seller flows пригодны для следующего Go/No-Go
review.

## Границы

- Deploy только в staging Preview с live-mode переменными для staging Supabase; не
  менять production project, Auth Site URL, production database или secrets.
- До deploy подтвердить exact release commit и Preview environment boundary без
  чтения/записи значений secrets.
- Owner/Seller checklist на каждом устройстве: login/logout; Receive Flow + Product
  code keyboard dismiss; product search/sale; Owner Adjust Stock; Movement History;
  Audit Log; Reports. Проверить EN и Turkish keyboard paths where available.
- Записывать только safe evidence: device class, OS/browser version, keyboard locale,
  action and before/after non-sensitive fixture. Не записывать real customer data,
  identities, tokens или credentials.
- Каждый новый defect фиксировать отдельной task; не исправлять его в этой task.

## Критерии готовности

- Shared staging Preview Ready и не использует demo/mock fallback в live failure.
- Owner/Seller walkthrough пройден или все findings вынесены в отдельные TASK с
  severity and reproduction.
- Нет production mutation и нет secret в repository/evidence.
- Документация статуса/roadmap/changelog обновлена; Go/No-Go gates обновлены только
  фактическим evidence.

## Проверки

- Preview deployment inspect + public safe route smoke.
- Owner/Seller physical iPhone/Android checklist.
- Targeted local regression for any staging finding.

## Текущий результат и блокер

- Первый snapshot был пересобран после исключения локальных `.next-*` build caches.
  Итоговый clean deploy snapshot
  `c2f9aaa0adb2cf570460f15601978ef145883e2d` содержит reviewed remediation set,
  но не содержит `.env*`, `.vercel`, `.git`, `node_modules` или build/test artifacts;
  перед upload его рабочее дерево было clean.
- Owner явно подтвердил publish только в staging Vercel project. Publish создал
  Preview deployment, но тот был заблокирован Vercel до build/runtime; детали и
  отдельный remediation scope — в finding ниже и TASK-167.

## Staging finding — 2026-08-20

- Compact non-secret snapshot
  `c2f9aaa0adb2cf570460f15601978ef145883e2d` создал отдельный Preview
  `zebra-inventory-sales-frqey2j2l-cooloxs-projects.vercel.app`, но Vercel
  заблокировал deployment до build/runtime: dashboard `Deployment Blocked`,
  `Environment: Preview`, duration `—`; public URL показывает `Deployment is
  blocked`.
- Build/runtime request logs пусты. Это не regression приложения, а external
  staging deployment blocker. Production, Supabase, Auth URL и repository secrets
  не менялись; secret values не читались и не записывались в repository/evidence.
- Finding вынесен в [TASK-167](TASK-167.md). До Ready Preview невозможно проводить
  honest safe-route smoke и physical Owner/Seller iPhone/Android walkthrough.

## Follow-up after TASK-167

- Vercel Preview blocker снят: live Preview стал Ready. Safe login smoke нашёл
  оставшийся старый `ZB` mark в unauthenticated shell; это вынесено в
  [TASK-168](TASK-168.md).
- Device walkthrough не начинается до исправления и повторной staging safe check
  этого visual finding, чтобы Owner проверял единый brand candidate.

## Resumed after TASK-168

- Ready staging Preview
  `https://zebra-inventory-sales-bokm6pf92-cooloxs-projects.vercel.app` now
  passes the affected public login safe smoke with the Zebra Boutique mark.
- Continue only with the documented physical Owner/Seller iPhone and Android
  checklist. Do not send Magic Link or perform inventory/sale writes without the
  Owner on the intended staging test identities and fixtures.

## Consolidated remediation Preview — 2026-08-21

- Reviewed remediation snapshot was published to the existing staging Vercel
  project without `.git`, `.env*`, `.vercel`, `node_modules` or build artifacts.
  Vercel ran `npm run build:live` and deployment
  `dpl_zyGtZsejdKXsc8JFRnD5egVYNXX9` is `Ready`:
  `https://zebra-inventory-sales-eli6hmy56-cooloxs-projects.vercel.app`.
- Safe unauthenticated smoke loaded the login route and confirmed the visible
  Zebra Boutique mark and Magic Link action. No Magic Link was sent, no session
  was created, and no staging inventory, sales or configuration was modified.
- This exact Preview is the staging origin for the next TASK-169 Auth callback
  synchronization; Production remains untouched.

## TASK-180 iPhone evidence — 2026-08-21

- Owner confirmed the supported Safari Home Screen path on iPhone for the current
  staging Preview: the app installs, launches as an installed PWA and works
  correctly. No Shortcut/downloader is needed and no personal Auth data was saved.
- Fresh Owner/Seller Magic Link acceptance is recorded in TASK-169. The remaining
  TASK-165 checklist continues for shared Owner/Seller mobile evidence.

## Current completion boundary — 2026-08-21

- TASK-180 iPhone Safari/PWA boundary is closed and its current live staging Preview
  is Ready. This confirms the supported installation path, not the full remediation
  release candidate.
- Per TASK-190, TASK-165 can complete only after every TASK-170—TASK-189 is either
  `COMPLETED` with evidence or explicitly excluded by Owner. All TASK-170—TASK-189
  are completed, including TASK-172, TASK-173, TASK-177, TASK-178, TASK-181,
  TASK-186 and TASK-189.
- Therefore the remaining Owner/Seller Android and shared-flow rechecks must use a
  reviewed consolidated Preview after those remediation tasks finish. No production
  mutation or secret handling occurred in this task.

## Post-intake publish precheck — 2026-08-22

- Current reviewed local tree is clean at `dd892e3` plus the completed visual-fix
  commits `1419eda`, `1cfb198`, `b41ce35` and `a22d994`; no secret was read.
- Existing Vercel staging identity was confirmed read-only as `coolox` using a
  Node-18-compatible CLI. The current CLI requires Node 20 and was not used for
  deployment.
- Preview publication was not performed: the external-action boundary requires an
  explicit Owner confirmation that this repository may be uploaded to the named
  Vercel staging account/project. No Vercel, Supabase, Auth or production resource
  was changed. After that confirmation, deploy only without `--prod`, inspect the
  resulting URL, and continue the physical checklist below.

## Safe web precheck — 2026-08-20

- Ready Preview public login loaded at
  `https://zebra-inventory-sales-bokm6pf92-cooloxs-projects.vercel.app` in live
  mode: Zebra Boutique mark, English/Turkish switch and enabled Magic Link action
  are visible. No Magic Link was sent and no authenticated action occurred.
- Connected Chrome could not apply an actual phone viewport (reported desktop-width
  after the requested mobile override), so it is not recorded as iPhone or Android
  evidence.

## Blocker: required physical Owner walkthrough

TASK-165 needs Owner-run tests on a real iPhone and real Android with the intended
staging test identities. Record only device class, OS/browser, keyboard locale,
action and non-sensitive before/after fixture result:

1. Open the Ready Preview; login then logout as Owner and Seller.
2. On each device test Receive Flow Product code: type, keyboard Done/Go, and IME
   if available; confirm code is preserved.
3. Test product search and a safe staging sale; as Owner test Adjust Stock,
   Movement History, Audit Log and Reports. Record the fixture before/after only.
4. Repeat relevant paths in EN and Turkish keyboard where available. Stop at any
   defect and provide reproduction; it will receive a separate TASK.

Until this evidence arrives, device acceptance and renewed TASK-149 Go/No-Go are
not complete. No Production, Supabase or Auth configuration change is requested.

## Physical finding: Magic Link callback — 2026-08-20

- Owner requested a Magic Link from the Ready Preview on a physical device and,
  after opening it, was returned to login instead of an authenticated workspace.
  No identity, email address, token or link is recorded.
- The ready Preview origin is not the documented exact staging Auth Site URL/callback;
  the existing URL is a previous Preview. This is an Auth redirect boundary issue,
  not a password/login UI regression.
- Finding was resolved in [TASK-169](TASK-169.md): staging Auth now uses the exact
  consolidated Preview callback and Owner/Seller controlled Magic Link acceptance
  succeeded. No sensitive Auth data is recorded here.

## Physical finding: Android keyboard dismissal — 2026-08-21

- На Redmi 14 системное скрытие экранной клавиатуры сопровождается вибрацией и
  добавляет неожиданный символ в активное поле: `100` → `1004`, а Product code
  `SS55` → `SS55Q` или `SS55И`.
- Это physical regression существующего TASK-163 acceptance, затрагивающий сумму
  продажи и product identity. Finding изолирован в [TASK-170](TASK-170.md).
- Finding resolved in [TASK-170](TASK-170.md). The affected Android keyboard path
  remains part of the final shared recheck on the reviewed remediation Preview.

## Physical finding: Exchange доплата — 2026-08-21

- Owner обменял безопасную тестовую продажу €100 на товар стоимостью €170. После
  сохранения Sales History показывает итог €170, но доплата €70 не указывается
  отдельно.
- Это P1 financial-history finding: разница должна быть видна и согласована с
  payment/ledger/audit/reports. Finding изолирован в [TASK-171](TASK-171.md).
- По указанию Owner finding пока только записан; диагностика и исправление начнутся
  после завершения сбора багов.

## Physical finding: Sales Trend light theme — 2026-08-21

- На mobile light theme Owner отметил тяжёлый серый фон «пустой» части столбцов
  Sales Trend: он визуально конкурирует с фиолетовым значением выручки.
- Presentation finding изолирован в [TASK-172](TASK-172.md), с сохранением
  accessibility/tap behaviour TASK-157 и строгого retail visual language.
- По указанию Owner finding пока только записан; дизайн и код не менять до окончания
  сбора багов.

## Physical finding: Receive Flow secondary action — 2026-08-21

- В light theme action «Сохранить этот товар и добавить другой цвет» выглядит
  бледной и похожей на disabled, хотя её можно нажать.
- Visual affordance finding изолирован в [TASK-173](TASK-173.md): enabled state
  станет заметнее, но останется secondary по отношению к primary Save.
- По указанию Owner finding пока только записан; дизайн и код не менять до окончания
  сбора багов.

## Physical finding: Reconciliation terminology — 2026-08-21

- В Turkish Reconciliation labels `Beklenen` / `Gerçekleşen` и суммы €1/€3 не
  объясняют Owner, что они означают, откуда пришли и какое действие требуется.
- Financial-clarity finding изолирован в [TASK-174](TASK-174.md); она изменит только
  пояснение/представление, сохранив read-only Owner-only calculations TASK-153.
- По указанию Owner finding пока только записан; тексты, UI и расчёты не менять до
  окончания сбора багов.

## Physical finding: Add colour model identity — 2026-08-21

- В режиме Receive Flow «Добавить цвет» Owner всё ещё может менять gender и общие
  данные выбранной модели: Product code, название и производителя.
- P1 identity finding изолирован в [TASK-175](TASK-175.md): добавление цвета должно
  изменять только допустимые variant/receipt details, а не существующую модель.
- По указанию Owner finding пока только записан; диагностику и исправление не
  начинать до окончания сбора багов.

## Physical findings: Edit Product and photographs — 2026-08-21

- Owner меняет Product code через Edit Product, но `Save` не выполняет видимого
  сохранения и code остаётся прежним. Regression вынесен в [TASK-176](TASK-176.md).
- Owner запросил перенести Low-stock threshold в Edit Product, убрать его из обычной
  карточки и добавить безопасное изменение gender, name и purchase cost. Это
  отдельный audited data-scope follow-up [TASK-177](TASK-177.md).
- Owner также должен удалять ошибочно загруженную private product photo; private
  Storage/RLS/DB-safe flow вынесен в [TASK-178](TASK-178.md).
- По указанию Owner findings пока только записаны; работу не начинать до окончания
  сбора багов.

## Physical finding: Sales History business-date boundary — 2026-08-21

- Owner observed that Sales History `Сегодня` mixes sales made before midnight with
  safe sales made at `00:11`/`00:27`; the after-midnight sales were treated as
  yesterday in the creation/history boundary.
- P1 Istanbul business-date finding is isolated in [TASK-179](TASK-179.md); it must
  align sale write, History, reports and audit date boundaries.
- По указанию Owner finding пока только записан; диагностику и исправление не
  начинать до окончания сбора багов.

## Physical finding: iPhone PWA install — 2026-08-21

- Owner could not complete a Home Screen install; a third-party Shortcut/tool says
  it does not support the site, while its safe Auth summary reports an expired Magic
  Link. This is not yet Safari install evidence.
- Supported Safari PWA install plus same-browser fresh/expired Magic Link recovery
  is isolated in [TASK-180](TASK-180.md), linked to controlled TASK-169 acceptance.
- По указанию Owner finding пока только записан; диагностику и исправление не
  начинать до окончания сбора багов.

## Product presentation request: creator attribution — 2026-08-21

- Owner requested a professional, unobtrusive indication that the web app and PWA
  were created by Arslan Ram.
- Presentation/copy scope is isolated in [TASK-181](TASK-181.md); it must not
  interfere with operational screens or add unapproved external links.
- По указанию Owner request пока только записан; дизайн и код не менять до окончания
  сбора багов.

## Physical finding: Owner/Seller revenue comparison — 2026-08-21

- Owner reported a revenue difference between two mobile pages. Available screenshots
  are 18 minutes apart: €1,802/15 at 13:39 and €1,885/16 at 13:57, so one new €83
  sale or stale refresh can explain it; no mismatch is presumed from screenshots.
- The screen described as Seller also shows Owner actions, so controlled role/session,
  same-snapshot and scope evidence is required. Finding is [TASK-183](TASK-183.md).
- По указанию Owner finding пока только записан; диагностику и исправление не
  начинать до окончания сбора багов.

## Updated evidence: Owner/Seller revenue mismatch confirmed — 2026-08-21

- After Owner made one sale and refreshed both pages, same-minute screenshots show
  €2,002 / 16 on one screen and €2,085 / 17 on the other — again exactly €83 and
  one sale apart.
- [TASK-183](TASK-183.md) is now a confirmed P1 live-data/scope mismatch, not merely
  a possible 18-minute capture-time difference. No calculation change is made while
  Owner bug intake continues.

## Physical finding: Exchange item picker — 2026-08-21

- Exchange Flow opens a long native list of every store variant, which is unclear and
  hard to use on mobile. Owner wants Product code lookup first, then model colour and
  available size selection.
- P1 picker redesign is isolated in [TASK-184](TASK-184.md); atomic exchange and
  TASK-171 payment-difference accounting remain protected separate boundaries.
- По указанию Owner finding пока только записан; дизайн и код не менять до окончания
  сбора багов.

## Dashboard copy request: greeting — 2026-08-21

- Owner requested replacing `Merhaba Taylan, vardiya 09:00 açıldı` with
  `Merhaba Taylan, bol satışlar!`.
- Localized greeting copy is isolated in [TASK-185](TASK-185.md); no user/session or
  schedule behaviour changes are intended.
- По указанию Owner request пока только записан; copy и код не менять до окончания
  сбора багов.

## Product presentation request: sale-line photo — 2026-08-21

- Owner requested a compact photo beside each sold item in Sale Details, with tap to
  fullscreen preview, so code/name alone is not required to recognise the product.
- Historical private-photo and TASK-178 deletion boundary is isolated in
  [TASK-186](TASK-186.md): past sale details must not break after gallery edits.
- По указанию Owner request пока только записан; data strategy, дизайн и код не
  менять до окончания сбора багов.

## Physical finding: Audit Log Turkish localization — 2026-08-21

- Turkish Audit Log still displays `All actors`, `All entities`, `Date`, raw
  entity/action values and technical metadata such as `source` / `pricing mode`.
- P1 business-copy mapping is isolated in [TASK-187](TASK-187.md), preserving
  immutable audit evidence, filters and TASK-159 pagination behaviour.
- По указанию Owner finding пока только записан; copy, mapping и код не менять до
  окончания сбора багов.

## Reports request: Cash / Kasa report — 2026-08-21

- Owner requested a Reports dimension/button for cash: physical-friendly read-only
  payment summary of cash and transfers by currency, with period and print/export.
- Owner-only financial scope is isolated in [TASK-188](TASK-188.md); ledger-derived
  receipts must not be misrepresented as physical cash without a separate count.
- По указанию Owner request пока только записан; financial design, exports и код не
  менять до окончания сбора багов.

## Physical finding: Dashboard KPI truncation — 2026-08-21

- On Redmi 14 Android large `Yıl` dashboard values are truncated as `€10.4…` and
  `101 a…`; Owner needs full monetary and sale-count values, not ellipsis.
- P1 responsive KPI presentation finding is isolated in [TASK-189](TASK-189.md);
  it does not alter calculations or TASK-183 live-data scope diagnosis.
- По указанию Owner finding пока только записан; дизайн и код не менять до окончания
  сбора багов.

## Bug intake closed — 2026-08-21

- Owner confirmed the walkthrough bug list is complete. TASK-170—TASK-189 are the
  fixed remediation scope before publication; ordered plan and evidence rules are in
  [TASK-190](TASK-190.md).
- Implementation now starts with TASK-179. This TASK remains blocked until one
  consolidated Preview contains the completed remediation set and exact staging Auth
  callback, after which the full physical Owner/Seller checklist resumes.

## Physical finding: Reports seller attribution — 2026-08-21

- В Seller dimension Reports Owner видит `Unknown seller` для собственных продаж.
  При отсутствии имени Owner хочет видеть email, а не неизвестного продавца.
- P1 report identity/privacy finding изолирован в [TASK-182](TASK-182.md): display
  name → approved email → explained genuine-unknown fallback только в разрешённом
  Owner context.
- По указанию Owner finding пока только записан; диагностику и исправление не
  начинать до окончания сбора багов.
