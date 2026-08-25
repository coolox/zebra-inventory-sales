# TASK-204 — Подготовить sales presentation и premium landing для Zebra Retail

Статус: pending

## Контекст и цель

Owner хочет продаваемую презентацию продукта для потенциальных владельцев
fashion/retail-магазинов. Результат должен объяснять бизнес-ценность Zebra Retail,
проводить человека от его текущей боли к понятному запросу demo и выглядеть как
современный premium B2B retail product — не как техническая документация.

Это отдельная marketing-задача. Она не меняет production app, реальные inventory
data, Auth, Supabase или текущий TASK-088 pilot.

## Целевая аудитория

- Владелец небольшого или среднего магазина одежды, который считает товар,
  продажи и деньги вручную, в заметках или разрозненных таблицах.
- Владелец с несколькими продавцами, которому важны контроль ролей, понятная
  история действий и остатки в реальном времени.
- Решение покупает владелец; продавец — пользователь, поэтому продаём и
  управляемость, и простоту ежедневной работы.

## Positioning

Рабочая формула: **"Zebra Retail gives a fashion store a live, accountable view
of stock, sales and team operations — from the phone or desktop."**

Не продавать «складскую программу». Продавать результат:

1. Владелец видит, что есть в наличии и что происходит с деньгами.
2. Продавец быстрее принимает товар и оформляет продажу без хаоса.
3. Любое движение товара и денег имеет историю, роль и проверяемый след.
4. Магазин может расти без потери контроля.

## Landing narrative

### 1. Hero — control, not software

- Headline: короткое обещание контроля над магазином; без технических терминов.
- Subheadline: stock, sales and team in one live workspace.
- Primary CTA: `Request a demo` / `Демо для моего магазина`.
- Secondary CTA: `See how a sale works` — opens a short guided product story,
  не реальный login.
- Hero visual: красивый realistic product dashboard in a phone + desktop frame,
  с реальными UI-компонентами, но только sanitized demo data.

### 2. Pain → outcome

Три короткие пары: «не знаете остаток» → live stock; «неясно, кто сделал
операцию» → role-based audit trail; «продажа и касса расходятся» → reconciled
sales and payment view. Не перегружать словами «RLS», «RPC» или «migration».

### 3. Daily flow

Показать один понятный маршрут в четыре шага:

`Receive product → Find by code/photo → Complete sale → Owner sees result`.

Каждый шаг — крупный screenshot/mockup, одна польза и один короткий факт.

### 4. Owner control

- Live stock and low-stock attention.
- Sales/reports and cash visibility.
- Seller access, store scope and audit history.
- Corrections through accountable operations, not erased history.

### 5. Seller simplicity

- Mobile-friendly search and product recognition.
- Colour/size-level receiving and selling.
- Clear payment and stock validation.
- Turkish/English interface support.

### 6. Trust and readiness

- Private product photos, role-based access and auditable operations.
- Encrypted recovery checkpoint / backup process described only in customer-safe
  terms; never expose provider configuration, secrets or internal IDs.
- Honest statement: web/PWA works on phone and desktop. Do not claim Play Store
  app, offline selling, multi-store rollout or automation that has not been
  accepted in the pilot.

### 7. CTA / sales handoff

- `Book a store walkthrough` or `Request a tailored demo`.
- Three low-friction fields maximum: name, store type, preferred contact method.
- No pricing invented until Owner decides packaging, support and commercial model.

## Visual direction

- Premium graphite/near-black base, violet accent and restrained lavender light;
  same serious Zebra UI language, but more editorial and spacious.
- Large product photography or carefully generated fashion-retail scenes only
  where licensing and source rights are clear. Product UI remains the proof.
- Strong typography, generous whitespace, fine grid, calm motion and no generic
  neon/AI-dashboard clichés.
- Mobile-first composition; desktop hero can use asymmetrical device frames.
- Accessibility: high contrast, visible focus, semantic headings, reduced-motion
  friendly transitions and clear CTA labels.

## Assets and content plan

1. Select 6–10 approved, sanitized app screens: overview, receive, inventory,
   sale, report, audit and mobile screen.
2. Create a demo narrative with synthetic store/product/amount data only.
3. Write EN-first copy with Turkish version after Owner approves the sales voice.
4. Prepare an optional 6–8 slide pitch version using the same story, not a
   separate visual system.
5. Add a reusable demo request endpoint/form only after Owner chooses the
   recipient and lead-handling process.

## Delivery phases

1. **Discovery** — Owner confirms target buyer, language, demo CTA recipient,
   pricing position and whether a public domain exists.
2. **Content and wireframe** — approved narrative, page hierarchy and screen list.
3. **Visual concept** — one high-fidelity desktop/mobile direction before code.
4. **Implementation** — isolated marketing surface; no dependency on live store
   session and no private data in client bundle.
5. **QA and publish** — performance, mobile, accessibility, form routing and
   Owner review; production publication requires explicit approval.

## Decisions needed from Owner before implementation

- Product/brand name to show publicly: `Zebra Retail`, `Zebra Boutique`, or a
  new commercial name.
- Primary sales language: Turkish, English, or bilingual.
- Audience geography and store segment.
- CTA destination and who answers leads.
- Pricing approach: show pricing, “request quote”, or demo-only.
- Whether to use real photos/screens after sanitisation or purpose-made visuals.
- Domain/hosting decision.

## Acceptance criteria

- A buyer can understand the product, daily workflow and value proposition in
  under two minutes without an agent explaining technical architecture.
- Every feature claim is demonstrable in the approved product or clearly marked
  as future scope.
- No customer, employee, invoice, secret, internal URL or production identifier
  is exposed.
- Mobile and desktop design is visually coherent, accessible and performance-aware.
- Owner approves content, visual direction and lead CTA before publication.
