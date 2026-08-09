-- Zebra Retail · Supabase foundation for the clothing pilot.
-- Apply only to a new staging/production Supabase project. No legacy bot data is imported.

create extension if not exists pgcrypto;
create extension if not exists citext;

create type public.app_role as enum ('owner', 'seller');
create type public.member_status as enum ('invited', 'active', 'blocked');
create type public.currency_code as enum ('EUR', 'USD', 'TRY', 'RUB', 'GBP');
create type public.receipt_status as enum ('draft', 'confirmed', 'cancelled');
create type public.receipt_source as enum ('manual', 'text', 'photo', 'pdf', 'import');
create type public.inventory_movement_type as enum ('receipt', 'sale', 'exchange_in', 'exchange_out', 'transfer_in', 'transfer_out', 'adjustment', 'write_off', 'sale_cancellation');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  status public.member_status not null default 'invited',
  theme text not null default 'dark' check (theme in ('light', 'dark')),
  locale text not null default 'en' check (locale in ('en', 'tr')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = lower(code)),
  name text not null,
  category text not null default 'clothing',
  timezone text not null default 'Europe/Istanbul',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.store_memberships (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  status public.member_status not null default 'invited',
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  name citext not null,
  phone text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (store_id, name)
);

create table public.product_models (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  supplier_id uuid references public.suppliers(id) on delete set null,
  model_code text not null,
  barcode text,
  name text not null,
  brand text not null,
  category text not null,
  gender text not null check (gender in ('men', 'women', 'unisex')),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, model_code)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_model_id uuid not null references public.product_models(id) on delete cascade,
  color text not null,
  size text not null,
  barcode text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_model_id, color, size)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_model_id uuid not null references public.product_models(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  position smallint not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  unique (product_model_id, position)
);

create table public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  business_date date not null,
  currency public.currency_code not null,
  eur_rate numeric(18, 8) not null check (eur_rate > 0),
  entered_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (business_date, currency)
);

create table public.purchase_receipts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  supplier_id uuid references public.suppliers(id) on delete set null,
  status public.receipt_status not null default 'draft',
  source public.receipt_source not null default 'manual',
  document_number text,
  received_at timestamptz not null default now(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  confirmed_by uuid references public.profiles(id) on delete restrict,
  confirmed_at timestamptz,
  notes text,
  idempotency_key uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unique (store_id, idempotency_key),
  check ((status <> 'confirmed') or (confirmed_by is not null and confirmed_at is not null))
);

create table public.purchase_receipt_lines (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.purchase_receipts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_cost numeric(14, 2) not null check (unit_cost >= 0),
  currency public.currency_code not null,
  eur_rate numeric(18, 8) not null check (eur_rate > 0),
  unit_cost_eur numeric(14, 2) not null check (unit_cost_eur >= 0),
  created_at timestamptz not null default now(),
  unique (receipt_id, variant_id)
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  movement_type public.inventory_movement_type not null,
  quantity integer not null check (quantity <> 0),
  occurred_at timestamptz not null default now(),
  actor_id uuid references public.profiles(id) on delete restrict,
  receipt_line_id uuid references public.purchase_receipt_lines(id) on delete restrict,
  reason text,
  idempotency_key uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unique (store_id, idempotency_key)
);

create index inventory_movements_variant_store_idx on public.inventory_movements (variant_id, store_id, occurred_at desc);
create index product_models_store_code_idx on public.product_models (store_id, model_code);
create index product_variants_model_idx on public.product_variants (product_model_id);

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, phone, status)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.raw_user_meta_data ->> 'phone', 'invited')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

create or replace function public.user_has_store_access(target_store_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.store_memberships membership
    where membership.store_id = target_store_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
  );
$$;

create or replace function public.user_is_store_owner(target_store_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.store_memberships membership
    where membership.store_id = target_store_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and membership.role = 'owner'
  );
$$;

grant execute on function public.user_has_store_access(uuid) to authenticated;
grant execute on function public.user_is_store_owner(uuid) to authenticated;

-- The project is created with automatic table exposure disabled. Grant only the
-- minimum read capability required by the Data API; RLS policies below still
-- decide which rows each authenticated user can see. Writes use RPCs only.
grant usage on schema public to authenticated;
grant select on table public.profiles,
  public.stores,
  public.store_memberships,
  public.suppliers,
  public.product_models,
  public.product_variants,
  public.product_images,
  public.exchange_rates,
  public.purchase_receipts,
  public.purchase_receipt_lines,
  public.inventory_movements to authenticated;

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.store_memberships enable row level security;
alter table public.suppliers enable row level security;
alter table public.product_models enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.purchase_receipts enable row level security;
alter table public.purchase_receipt_lines enable row level security;
alter table public.inventory_movements enable row level security;

create policy "profiles: read same store" on public.profiles for select to authenticated using (
  id = (select auth.uid()) or exists (
    select 1 from public.store_memberships mine join public.store_memberships theirs on theirs.store_id = mine.store_id
    where mine.user_id = (select auth.uid()) and mine.status = 'active' and theirs.user_id = profiles.id
  )
);
create policy "stores: member read" on public.stores for select to authenticated using (public.user_has_store_access(id));
create policy "memberships: member read" on public.store_memberships for select to authenticated using (public.user_has_store_access(store_id));
create policy "suppliers: member read" on public.suppliers for select to authenticated using (public.user_has_store_access(store_id));
create policy "models: member read" on public.product_models for select to authenticated using (public.user_has_store_access(store_id));
create policy "variants: member read" on public.product_variants for select to authenticated using (exists (select 1 from public.product_models model where model.id = product_model_id and public.user_has_store_access(model.store_id)));
create policy "images: member read" on public.product_images for select to authenticated using (exists (select 1 from public.product_models model where model.id = product_model_id and public.user_has_store_access(model.store_id)));
create policy "rates: member read" on public.exchange_rates for select to authenticated using (exists (select 1 from public.store_memberships m where m.user_id = (select auth.uid()) and m.status = 'active'));
create policy "receipts: member read" on public.purchase_receipts for select to authenticated using (public.user_has_store_access(store_id));
create policy "receipt lines: member read" on public.purchase_receipt_lines for select to authenticated using (exists (select 1 from public.purchase_receipts receipt where receipt.id = receipt_id and public.user_has_store_access(receipt.store_id)));
create policy "movements: member read" on public.inventory_movements for select to authenticated using (public.user_has_store_access(store_id));

create or replace function public.update_my_preferences(preferred_theme text, preferred_locale text)
returns public.profiles language plpgsql security definer set search_path = '' as $$
declare
  updated_profile public.profiles;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required';
  end if;

  if preferred_theme not in ('light', 'dark') or preferred_locale not in ('en', 'tr') then
    raise exception 'Unsupported preference value';
  end if;

  update public.profiles
  set theme = preferred_theme,
      locale = preferred_locale,
      updated_at = now()
  where id = (select auth.uid())
  returning * into updated_profile;

  if updated_profile is null then
    raise exception 'Profile not found';
  end if;

  return updated_profile;
end;
$$;

revoke all on function public.update_my_preferences(text, text) from public;
grant execute on function public.update_my_preferences(text, text) to authenticated;

-- Mutations will be exposed only through audited RPC functions in the next migrations.
-- No direct INSERT/UPDATE/DELETE policy is intentionally granted for inventory documents or movements.
