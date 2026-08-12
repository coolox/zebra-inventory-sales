# Архитектура Zebra Retail

## Назначение

Zebra Retail — Next.js web/PWA для каталога, приёмки, продаж и отчётов сети магазинов. Первый production pilot — только Zebra Boutique. Supabase предоставляет Auth, Postgres, RLS и private Storage.

## Runtime boundary

```text
Next.js UI
  ├── demo mode → local mock/persistence adapter
  └── live mode → Supabase client/server boundary
                         ├── Auth + memberships
                         ├── RLS-protected reads
                         ├── audited transactional RPC
                         └── private product Storage
```

`NEXT_PUBLIC_APP_MODE=demo|live` задаёт источник данных. Live mode никогда не заменяет ошибку mock-данными. Production и staging должны использовать разные Supabase/Vercel projects.

## Frontend modules

- `app/` — routes, auth callback, session endpoint и dashboard composition.
- `components/layout/` — общий shell, navigation, header и modal host после декомпозиции.
- `components/ui/` — небольшие переиспользуемые controls и states.
- `features/workspace/` — mode boundary и workspace snapshot.
- `features/catalog/` — модели, варианты, поиск, Product Card и фотографии.
- `features/inventory/`, `features/receipts/` — movements, stock и приёмка.
- `features/sales/` — cart, payment drafts, sale queries/mutations и domain errors.
- `features/sellers/`, `features/audit/`, `features/reports/` — Owner operations.
- `lib/contracts/` — transport-independent DTO и commands.
- `lib/supabase/` — browser/server clients; не содержит domain UI.

UI получает нормализованные models и не должен работать с raw Supabase rows. Business mutations находятся в feature data/application layer, не в page components.

## API contracts

`lib/contracts/auth.ts` определяет session DTO: user, profile (`locale`, `theme`) и active membership со стабильными camelCase полями `storeId`, `role`, `status` и store metadata. `/api/session` нормализует Supabase rows в этот DTO до передачи клиенту.

`lib/contracts/workspace.ts` определяет `WorkspaceSnapshotDto` для products, sales, sellers и activity. Live и demo adapters возвращают этот snapshot, копируя mutable arrays на transport boundary. Contracts не импортируют Supabase types; persistence, web API и будущий Telegram adapter должны зависеть от них, а не от raw database rows.

Catalog, receipt и inventory contracts следуют тому же правилу: `CatalogVariantDto` содержит stable model/variant identity, optional barcode и native currency; `ConfirmReceiptCommand` явно содержит store, model, size/color lines, currency и idempotency key; `InventoryMovementDto` хранит variant, actor, source, reason и receipt reference. RPC payload собирается только в data adapter из command DTO.

## UI tokens and adaptive rules

`app/globals.css` is the compact source of visual tokens: `--bg`, `--panel`, `--panel-2`, `--line`, `--text`, `--muted`, semantic purple/green/red/amber accents, control/panel radius, panel spacing and `--focus-ring`. Dark values are default; `html[data-theme="light"]` overrides only theme values. New components must consume these tokens rather than introduce critical hard-coded theme colours.

- Selected controls use the purple accent; error uses `--red`; focus uses the shared `--focus-ring` and remains visible in both themes.
- Mobile is the base layout (single column, bottom-sheet modals); `sm` (640px) introduces horizontal form/action rows; `lg` (1024px) enables persistent dashboard navigation and multi-column panels.
- Tables must retain a compact card/list presentation below `sm`; text/action targets must not rely on hover alone.

## Data model

- Identity: `profiles`, `stores`, `store_memberships`.
- Catalog: `suppliers`, `product_models`, `product_variants`, `product_images`.
- Inventory: `purchase_receipts`, `purchase_receipt_lines`, `inventory_movements`.
- Sales: `sales`, `sale_lines`, `sale_payments`; позже cancellation и exchange.
- Finance/Audit: `exchange_rates`, `audit_logs`.

Model code общий для size/color variants. Variant identity — UUID. Stock воспроизводится суммой inventory movements.

## Обязательные инварианты

- Authenticated user видит только stores с active membership.
- UI visibility не заменяет server-side RLS/RPC authorization.
- Receipt, sale, cancellation, exchange и adjustment изменяют stock только атомарно.
- Financial rows сохраняют original currency, FX и EUR snapshots.
- Исторические snapshots не пересчитываются новым курсом или catalog data.
- Critical operation имеет actor, source, reason при необходимости и audit record.
- Повтор внешнего command защищён idempotency key.
- Production secrets и персональные данные не попадают в repository или logs.

## Task workflow

Каждая новая сессия читает `AGENTS.md`, `docs/PROJECT_STATUS.md`, выбранный `docs/tasks/TASK-NNN.md` и только перечисленные там файлы. `docs/DECISIONS.md` читается лишь когда задача требует продуктового решения. После завершения обновляются task status и `PROJECT_STATUS.md`; следующая задача не начинается автоматически.
