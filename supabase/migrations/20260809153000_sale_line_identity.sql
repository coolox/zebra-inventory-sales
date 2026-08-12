-- Zebra Retail · allow one variant to be sold at different prices or currencies
-- within the same atomic sale.
--
-- The original constraint identified a sale line only by sale + variant. The
-- client intentionally keeps differently priced/currency amounts as separate
-- lines so that each line preserves its own financial and FX snapshots.

alter table public.sale_lines
drop constraint if exists sale_lines_sale_id_variant_id_key;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.sale_lines'::pg_catalog.regclass
      and conname = 'sale_lines_sale_id_variant_id_unit_price_currency_key'
  ) then
    alter table public.sale_lines
    add constraint sale_lines_sale_id_variant_id_unit_price_currency_key
    unique (sale_id, variant_id, unit_price, currency);
  end if;
end;
$$;

