begin;

select plan(7);

select ok(to_regclass('public.stores') is not null, 'stores table exists after a clean migration run');
select ok(to_regclass('public.inventory_movements') is not null, 'inventory movements table exists after a clean migration run');
select ok(to_regclass('public.sales') is not null, 'sales table exists after a clean migration run');
select ok(to_regclass('public.sale_lines') is not null, 'sale lines table exists after a clean migration run');
select ok(to_regclass('public.sale_payments') is not null, 'sale payments table exists after a clean migration run');
select ok(to_regtype('public.sale_pricing_mode') is not null, 'sale pricing mode is installed');
select ok(
  to_regprocedure('public.confirm_sale_with_payments(uuid,jsonb,jsonb,uuid,timestamptz,public.sale_pricing_mode)') is not null,
  'native-currency sale RPC is installed'
);

select * from finish();

rollback;
