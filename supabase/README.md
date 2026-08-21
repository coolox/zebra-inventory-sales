# Supabase setup

1. Create separate `staging` and `production` Supabase projects. Do not use the legacy VPS database. In project creation: enable Data API, disable automatic table exposure, and enable automatic RLS for new public tables.
2. Apply migrations in chronological order through the Supabase CLI. Do not use the hosted SQL Editor for a project managed by repository migrations: it bypasses migration history and makes later `db push` unsafe.
3. Create a private `.env.local` from `.env.example` and add only the project URL and publishable/anon key. Never commit it.
4. Configure Magic Link redirect URLs before enabling login. The next migration will add authenticated write RPCs for receipts, sales, exchange and cancellation.

## Temporary staging Magic Link Preview

For the current staging test cycle, Supabase Auth Site URL is `https://zebra-inventory-sales-bokm6pf92-cooloxs-projects.vercel.app`. Its exact callback URL and `http://localhost:3000/auth/callback` are in the redirect allow-list. This is intentionally temporary: before a new Vercel Preview is tested, replace the Preview Site URL and add its exact `/auth/callback` allow-list entry; do not use a broad `*.vercel.app` wildcard.

The selected Preview must also be deployed with `NEXT_PUBLIC_APP_MODE=live`, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Keep the values in Vercel environment settings only — never commit them. Use `shouldCreateUser: false`: an unknown email must not create an Auth user.

The foundation migration deliberately grants read access through RLS but no direct inventory mutations. Financial and stock-changing operations must be atomic audited RPCs.

## Production migration protocol

Use the CLI only after the production project is empty, linked by the Owner who enters
the database password locally, and a clean local rehearsal has passed. Never put the
project ref, connection string or password into Git, shell history shared with others
or chat.

```bash
npx --yes supabase@2.113.0 db push --dry-run
npx --yes supabase@2.113.0 db push
npx --yes supabase@2.113.0 db push --dry-run
```

The first command must list exactly the repository migrations and no seed data; the
last must report `upToDate`. Do not use `db reset --linked` against production: it is
destructive. Schema rollback is compensating forward migration; data recovery uses
the isolated restore procedure in `docs/operations/ROLLBACK.md`.

## Local SQL integration harness

The local harness never connects to staging or production and contains no fixtures, secrets or personal data. It uses a Docker-backed Supabase stack and starts from migrations only.

Prerequisite: Docker Desktop must be running. Then use the pinned CLI commands:

```bash
npm run supabase:start
npm run supabase:verify
```

`supabase:verify` resets the local database, reapplies every migration from a clean state, and runs the pgTAP baseline in `supabase/tests/database`. Run `npm run supabase:verify` a second time to verify reset reproducibility. Stop the local stack with `npx --yes supabase@2.113.0 stop` when finished.

## Bootstrap the first Owner (controlled staging or production)

After the first user has been created in Supabase Auth, the `on_auth_user_created` trigger creates `public.profiles` automatically. Run this in the SQL Editor and replace `OWNER_PROFILE_UUID` with that user's `auth.users.id`.

```sql
insert into public.stores (code, name, category)
values ('zebra-boutique', 'Zebra Boutique', 'clothing')
on conflict (code) do nothing;

insert into public.store_memberships (store_id, user_id, role, status)
select store.id, profile.id, 'owner', 'active'
from public.stores as store
join public.profiles as profile on profile.id = 'OWNER_PROFILE_UUID'::uuid
where store.code = 'zebra-boutique'
on conflict (store_id, user_id) do update
set role = 'owner', status = 'active';

update public.profiles
set status = 'active', updated_at = now()
where id = 'OWNER_PROFILE_UUID'::uuid;
```

The initial Owner is intentionally bootstrapped through the dashboard SQL Editor only
after the full migration chain is recorded by CLI. Keep the UUID out of SQL history,
task files and chat. The app will later provide the audited Owner invite flow for
Sellers. Do not seed catalog, stock or pilot users during the migration rehearsal.

## Receipt FX date correction

Apply `migrations/20260809010000_receipt_business_date.sql` in the **staging SQL Editor** before retrying a receipt. It preserves the actual receipt timestamp but looks up the exchange rate using Zebra Boutique's `Europe/Istanbul` business date, including after midnight. It is safe to apply once after the earlier receipt migration.

Staging status (2026-08-10): applied and verified on `zebra-retail-staging`. A before/after-midnight EUR/USD fixture confirmed Istanbul business dates, matching FX snapshots, receipt lines, inventory movements, audit records and idempotent replay. Production was not changed. The early migration was applied through SQL Editor, so it is not present in the CLI migration history.

## Product photos

Apply `migrations/20260809013000_product_images.sql` in the **staging SQL Editor** before using `Add photos` in a product card. It creates the private `product-images` Storage bucket, limits uploads to JPEG/PNG/WebP up to 8 MB, and allows active members to see and upload images only for their own store. Image files live in Storage; Postgres stores only their paths and carousel order.

Staging status (2026-08-10): the bucket, 8 MiB/MIME restrictions, RPC and three RLS policies are present. Nine Storage objects have matching database records, a three-photo carousel survives live reload, and a no-membership authenticated subject sees zero objects and cannot insert into another store path. A fresh browser upload plus invalid MIME/oversize smoke still requires **Allow access to file URLs** for the ChatGPT Chrome extension. Production was not changed.

## Catalog barcodes

Apply `migrations/20260811090000_product_barcodes.sql` after the current catalog migrations and before barcode search UI. It preserves existing non-empty barcodes, trims accidental outer whitespace, and enforces one case-insensitive barcode claim per store across both `product_models` and `product_variants`. The same barcode may exist in another store. If old data already has two claims for the same barcode in one store, the migration stops without changing those claims; resolve that ambiguity deliberately, then reapply the migration.

Run `npm run supabase:verify` after applying the migration locally. The barcode pgTAP test covers same-store rejection, cross-store allowance and RLS read scope.

## Inventory adjustments

`migrations/20260811110000_inventory_adjustments.sql` adds the Owner-only `confirm_inventory_adjustment` RPC. It never updates a balance directly: it locks the variant, records a signed `adjustment` movement with a mandatory reason, blocks negative stock and writes an audit row with the before/after balance. It is idempotent for a repeated store idempotency key.

Staging status (2026-08-11): applied manually in the SQL Editor because the remote migration history is incomplete and CLI `db push` would include unrelated older migrations. A controlled `+1` and compensating `-1` smoke test left the selected variant at its original stock (3) and produced two movements plus two audit records. Production was not changed.

Rollback before barcode search/write UI is released: drop `product_models_barcode_unique`, `product_variants_barcode_unique`, `assert_store_barcode_unique()`, `product_models_store_barcode_lookup_idx`, and `product_variants_barcode_lookup_idx`. This only removes enforcement and lookup indexes; it does not delete any barcode values. Do not roll back after relying on barcode uniqueness in downstream UI or integrations without a replacement validation boundary.

## Sales foundation

Apply `migrations/20260809020000_sales_foundation.sql` in the **staging SQL Editor** before connecting the live Sale Flow. It creates sales, sale lines and payment tables plus an atomic `confirm_sale` RPC: it verifies stock, snapshots price/cost/FX, writes a negative inventory movement and an audit event in one transaction.

After the sales and payment migrations, apply `migrations/20260809153000_sale_line_identity.sql`. It allows one size/color variant to appear more than once in a sale when the actual price or currency differs, while identical variant + price + currency lines remain unique. `confirm_sale` continues to lock the variant and recalculate stock after every line, so a later line with insufficient stock rolls back the entire sale.

To roll back this migration before the mixed-currency behavior is used, drop `sale_lines_sale_id_variant_id_unit_price_currency_key` and restore `unique (sale_id, variant_id)`. Do not roll it back after sales containing repeated variants have been recorded unless those rows have first been reconciled, because the old constraint cannot represent them.

Apply `migrations/20260809160000_native_currency_payments.sql` after the previous sales migrations to replace the EUR-only mixed-payment RPC. It accepts payment entries with `method`, `amount`, and `currency`; snapshots the business-date EUR rate for every payment; and rejects a payment total that differs from the sale total by more than EUR 0.01. Any invalid payment or missing rate rolls back the sale, its stock movements and its payments together.
