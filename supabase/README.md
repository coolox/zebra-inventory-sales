# Supabase setup

1. Create separate `staging` and `production` Supabase projects. Do not use the legacy VPS database. In project creation: enable Data API, disable automatic table exposure, and enable automatic RLS for new public tables.
2. Apply migrations to staging in chronological order through the Supabase SQL Editor or CLI. After the foundation, apply the receipt, exchange-rate, business-date, and product-images migrations before testing their corresponding live flows.
3. Create a private `.env.local` from `.env.example` and add only the project URL and publishable/anon key. Never commit it.
4. Configure Magic Link redirect URLs before enabling login. The next migration will add authenticated write RPCs for receipts, sales, exchange and cancellation.

The foundation migration deliberately grants read access through RLS but no direct inventory mutations. Financial and stock-changing operations must be atomic audited RPCs.

## Bootstrap the first Owner (staging only)

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

The initial Owner is intentionally bootstrapped through the dashboard SQL Editor. The app will later provide the audited Owner invite flow for Sellers.

## Receipt FX date correction

Apply `migrations/20260809010000_receipt_business_date.sql` in the **staging SQL Editor** before retrying a receipt. It preserves the actual receipt timestamp but looks up the exchange rate using Zebra Boutique's `Europe/Istanbul` business date, including after midnight. It is safe to apply once after the earlier receipt migration.

## Product photos

Apply `migrations/20260809013000_product_images.sql` in the **staging SQL Editor** before using `Add photos` in a product card. It creates the private `product-images` Storage bucket, limits uploads to JPEG/PNG/WebP up to 8 MB, and allows active members to see and upload images only for their own store. Image files live in Storage; Postgres stores only their paths and carousel order.

## Sales foundation

Apply `migrations/20260809020000_sales_foundation.sql` in the **staging SQL Editor** before connecting the live Sale Flow. It creates sales, sale lines and payment tables plus an atomic `confirm_sale` RPC: it verifies stock, snapshots price/cost/FX, writes a negative inventory movement and an audit event in one transaction.
